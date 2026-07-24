/**
 * Part controller.
 * CRUD operations for parts and hotspot (image coordinate) management.
 */
import pool from '../config/database.js';
import { generateUUID, uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
import {
  validateRequired,
  validateUUID,
  validateCoordinate,
} from '../utils/validators.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

const PART_FIELDS = ['id'];
const COORD_FIELDS = ['id', 'part_id', 'image_id'];

/**
 * POST /api/admin/parts
 * Create a part with an optional hotspot on a diagram.
 * If image_id is provided WITHOUT x_coordinate/y_coordinate, the part is
 * linked to the diagram as an "extra part" with no visible hotspot dot.
 */
export async function createPart(req, res, next) {
  try {
    const {
      serial_no,
      part_no,
      kubota_part_no,
      description,
      quantity,
      fm_code,
      image_id,
      x_coordinate,
      y_coordinate,
      radius,
    } = req.body;

    validateRequired(req.body, ['part_no']);

    const partId = generateUUID();
    const qty = quantity !== undefined ? parseInt(quantity, 10) : 1;

    let finalSerialNo = serial_no || null;

    // Auto-assign sequential serial_no when creating a hotspot on a diagram
    if (image_id && !finalSerialNo) {
      const [maxRows] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM image_coordinates WHERE image_id = ?`,
        [uuidToBuffer(image_id)]
      );
      finalSerialNo = String(maxRows[0].cnt + 1);
    }

    await pool.query(
      `INSERT INTO parts (id, serial_no, part_no, kubota_part_no, description, quantity, fm_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidToBuffer(partId),
        finalSerialNo,
        part_no,
        kubota_part_no || null,
        description || null,
        qty,
        fm_code || null,
      ]
    );

    const [partRows] = await pool.query(
      'SELECT id, serial_no, part_no, kubota_part_no, description, quantity, fm_code, created_at FROM parts WHERE id = ?',
      [uuidToBuffer(partId)]
    );

    const part = convertRow(partRows[0], PART_FIELDS);

    let coordinate = null;

    // If image_id provided, link the part to this diagram.
    // Coordinates are OPTIONAL — omitting them creates an "extra part"
    // (linked to the diagram/section, but with no hotspot dot on the image).
    if (image_id) {
      validateUUID(image_id, 'image_id');

      // Verify image exists
      const [imageCheck] = await pool.query(
        'SELECT id FROM images WHERE id = ?',
        [uuidToBuffer(image_id)]
      );

      if (imageCheck.length === 0) {
        throw new NotFoundError('IMAGE_NOT_FOUND', 'Diagram not found');
      }

      // Check for unique constraint (part_id, image_id)
      const [existingCoord] = await pool.query(
        'SELECT id FROM image_coordinates WHERE part_id = ? AND image_id = ?',
        [uuidToBuffer(partId), uuidToBuffer(image_id)]
      );

      if (existingCoord.length > 0) {
        throw new ConflictError('CONFLICT', 'A hotspot for this part and image already exists');
      }

      const hasPosition = x_coordinate !== undefined && y_coordinate !== undefined;

      let xVal = null;
      let yVal = null;
      let finalRadius = radius !== undefined ? parseInt(radius, 10) : 14;

      if (hasPosition) {
        validateCoordinate(x_coordinate, 'x_coordinate');
        validateCoordinate(y_coordinate, 'y_coordinate');
        xVal = parseFloat(x_coordinate);
        yVal = parseFloat(y_coordinate);
        // finalRadius = radius !== undefined ? parseInt(radius, 10) : 14;
      }

      const coordId = generateUUID();
      await pool.query(
        `INSERT INTO image_coordinates (id, part_id, image_id, x_coordinate, y_coordinate, radius)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidToBuffer(coordId),
          uuidToBuffer(partId),
          uuidToBuffer(image_id),
          xVal,
          yVal,
          finalRadius,
        ]
      );

      const [coordRows] = await pool.query(
        'SELECT id, part_id, image_id, x_coordinate, y_coordinate, radius, created_at FROM image_coordinates WHERE id = ?',
        [uuidToBuffer(coordId)]
      );

      coordinate = convertRow(coordRows[0], COORD_FIELDS);
    }

    res.status(201).json({ success: true, part, coordinate });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/parts/bulk
 * Bulk-create multiple parts at once from pasted spreadsheet data.
 * Mirrors createPart's single-row rules exactly: part_no is required,
 * everything else optional (stored as null when missing, no defaults).
 * Every row gets linked to image_id as an "extra part" (coordinate row
 * created with null x/y) — placement always happens afterward through
 * the existing HotspotEditor flow, same as manually-added parts.
 *
 * NEW — does not alter createPart, getPartsByImage's existing return
 * shape, or any other existing behavior.
 */
export async function bulkCreateParts(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { image_id, rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestError('INVALID_INPUT', 'rows must be a non-empty array');
    }
    if (image_id) {
      validateUUID(image_id, 'image_id');
    }

    // Look up which of these part_no values already exist as parts, and
    // whether they're already linked (via image_coordinates) to THIS
    // diagram specifically. This makes bulk import safe to re-run:
    // - brand new part_no -> create part + link to diagram (as before)
    // - existing part_no not yet linked to this diagram -> just link it
    //   here (no duplicate part record created)
    // - existing part_no already linked to this diagram -> true duplicate,
    //   skipped
    const candidatePartNos = [...new Set(
      rows.map((r) => (r?.part_no ? String(r.part_no).trim() : '')).filter(Boolean)
    )];
    const existingMap = new Map(); // part_no -> { id, linkedToThisImage }
    if (candidatePartNos.length > 0) {
      const [existingRows] = await pool.query(
        `SELECT p.id AS part_id, p.part_no,
                ic.id AS coord_id
         FROM parts p
         LEFT JOIN image_coordinates ic ON ic.part_id = p.id AND ic.image_id = ?
         WHERE p.part_no IN (?)`,
        [image_id ? uuidToBuffer(image_id) : Buffer.alloc(16), candidatePartNos]
      );
      for (const r of existingRows) {
        existingMap.set(r.part_no, {
          id: bufferToUuid(r.part_id),
          linkedToThisImage: !!r.coord_id,
        });
      }
    }

    // Build the list of valid rows first (same per-row rules as before),
    // then insert everything in batched queries instead of looping one
    // query at a time — this is what actually fixes request timeouts on
    // larger imports (e.g. 60+ rows), since it turns ~120 sequential
    // round-trips into a handful.
    const createdParts = [];
    const linkedParts = [];
    const skipped = [];
    const partValues = [];
    const coordValues = []; // for brand-new parts
    const linkOnlyValues = []; // for existing parts not yet linked to this image
    const seenInThisBatch = new Set();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};
      const part_no = row.part_no ? String(row.part_no).trim() : '';

      if (!part_no) {
        skipped.push({ row: i + 1, reason: 'Missing Part No' });
        continue;
      }

      if (seenInThisBatch.has(part_no)) {
        skipped.push({ row: i + 1, reason: `Part No "${part_no}" appears more than once in this paste — only the first was used` });
        continue;
      }

      const existing = existingMap.get(part_no);

      if (existing && existing.linkedToThisImage) {
        skipped.push({ row: i + 1, reason: `Part No "${part_no}" is already added to this diagram` });
        continue;
      }

      seenInThisBatch.add(part_no);

      if (existing && !existing.linkedToThisImage) {
        // Part already exists elsewhere in the catalog but isn't linked to
        // this diagram yet — link it here instead of creating a duplicate.
        if (image_id) {
          const coordId = generateUUID();
          linkOnlyValues.push([uuidToBuffer(coordId), uuidToBuffer(existing.id), uuidToBuffer(image_id), 14]);
          linkedParts.push({ id: existing.id, part_no });
        } else {
          skipped.push({ row: i + 1, reason: `Part No "${part_no}" already exists` });
        }
        continue;
      }

      // Brand new part_no
      const partId = generateUUID();
      const serial_no =
        row.serial_no !== undefined && row.serial_no !== null && String(row.serial_no).trim() !== ''
          ? String(row.serial_no).trim()
          : null;
      const kubota_part_no = row.kubota_part_no ? String(row.kubota_part_no).trim() : null;
      const description = row.description ? String(row.description).trim() : null;
      const quantity =
        row.quantity !== undefined && row.quantity !== null && String(row.quantity).trim() !== ''
          ? parseInt(row.quantity, 10)
          : null;
      const fm_code = null; // never provided by bulk import, always blank

      partValues.push([uuidToBuffer(partId), serial_no, part_no, kubota_part_no, description, quantity, fm_code]);

      // Link to diagram/image as an "extra part" — no coordinate yet.
      // (Matches createPart's existing behavior when image_id is given
      // without x_coordinate/y_coordinate.)
      if (image_id) {
        const coordId = generateUUID();
        coordValues.push([uuidToBuffer(coordId), uuidToBuffer(partId), uuidToBuffer(image_id), 14]);
      }

      createdParts.push({ id: partId, serial_no, part_no, kubota_part_no, description, quantity, fm_code });
    }

    await conn.beginTransaction();

    if (partValues.length > 0) {
      await conn.query(
        `INSERT INTO parts (id, serial_no, part_no, kubota_part_no, description, quantity, fm_code) VALUES ?`,
        [partValues]
      );
    }

    if (coordValues.length > 0) {
      await conn.query(
        `INSERT INTO image_coordinates (id, part_id, image_id, x_coordinate, y_coordinate, radius) VALUES ?`,
        [coordValues.map(([id, partId, imgId, radius]) => [id, partId, imgId, null, null, radius])]
      );
    }

    if (linkOnlyValues.length > 0) {
      await conn.query(
        `INSERT INTO image_coordinates (id, part_id, image_id, x_coordinate, y_coordinate, radius) VALUES ?`,
        [linkOnlyValues.map(([id, partId, imgId, radius]) => [id, partId, imgId, null, null, radius])]
      );
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      created: createdParts.length,
      linked: linkedParts.length,
      skipped,
      parts: createdParts,
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * DELETE /api/admin/parts?image_id=uuid
 * Bulk-delete every part linked to a given diagram (image) in one request —
 * used for cleaning up an accidental duplicate bulk import, or clearing a
 * diagram's parts entirely. Cascades to each part's hotspot the same way
 * the existing single deletePart already does.
 */
export async function deletePartsByImage(req, res, next) {
  try {
    const { image_id } = req.query;

    if (!image_id) {
      throw new BadRequestError('INVALID_INPUT', 'image_id is required');
    }
    validateUUID(image_id, 'image_id');

    const [rows] = await pool.query(
      `SELECT p.id FROM parts p JOIN image_coordinates ic ON ic.part_id = p.id WHERE ic.image_id = ?`,
      [uuidToBuffer(image_id)]
    );

    if (rows.length === 0) {
      return res.json({ success: true, deleted: 0 });
    }

    const ids = rows.map((r) => r.id);
    await pool.query('DELETE FROM parts WHERE id IN (?)', [ids]);

    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/parts?image_id=uuid (auth)
 * GET /api/diagrams/:id/parts (public)
 * Get all parts for a given diagram (image), including parts that have
 * no hotspot position (extra parts). Parts WITH a hotspot include their
 * x/y/radius under `coordinate`; parts without one have `coordinate: null`.
 */
export async function getPartsByImage(req, res, next) {
  try {
    let imageId;

    if (req.params.id) {
      imageId = req.params.id;
    } else {
      imageId = req.query.image_id;
    }

    if (!imageId) {
      throw new BadRequestError('INVALID_INPUT', 'image_id is required');
    }
    validateUUID(imageId, 'image_id');

    const [rows] = await pool.query(
      `SELECT p.id, p.serial_no, p.part_no, p.kubota_part_no, p.description, p.quantity, p.fm_code, p.created_at,
              ic.id AS coord_id, ic.x_coordinate, ic.y_coordinate, ic.radius
       FROM parts p
       LEFT JOIN image_coordinates ic ON ic.part_id = p.id AND ic.image_id = ?
       WHERE ic.image_id = ?
       ORDER BY CAST(p.serial_no AS UNSIGNED) ASC`,
      [uuidToBuffer(imageId), uuidToBuffer(imageId)]
    );

    const parts = rows.map((r) => {
      const part = convertRow(r, PART_FIELDS);
      const hasPosition = r.x_coordinate !== null && r.y_coordinate !== null;
      part.coordinate = hasPosition
        ? {
            id: bufferToUuid(r.coord_id),
            x_coordinate: parseFloat(r.x_coordinate),
            y_coordinate: parseFloat(r.y_coordinate),
            radius: r.radius !== null && r.radius !== undefined ? parseInt(r.radius, 10) : 14,
          }
        : null;
      // NEW — exposes the raw coordinate row id even when position isn't
      // set yet, so bulk-imported "awaiting placement" parts can later be
      // placed via the existing hotspot-update endpoint (no duplicate part
      // is ever created). Does not change the existing `coordinate` field
      // or its behavior at all.
      part.coordinate_id = r.coord_id ? bufferToUuid(r.coord_id) : null;
      return part;
    });

    res.json({ success: true, parts });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/parts/:id
 * Update a part's fields (no hotspot update here).
 */
export async function updatePart(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const {
      serial_no,
      part_no,
      kubota_part_no,
      description,
      quantity,
      fm_code,
    } = req.body;

    const [existing] = await pool.query(
      'SELECT id, serial_no, part_no, kubota_part_no, description, quantity, fm_code FROM parts WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('PART_NOT_FOUND', 'Part not found');
    }

    const updatedSerial = serial_no !== undefined ? serial_no : existing[0].serial_no;
    const updatedPartNo = part_no || existing[0].part_no;
    const updatedKubota = kubota_part_no !== undefined ? kubota_part_no : existing[0].kubota_part_no;
    const updatedDesc = description !== undefined ? description : existing[0].description;
    const updatedQty = quantity !== undefined ? parseInt(quantity, 10) : existing[0].quantity;
    const updatedFm = fm_code !== undefined ? fm_code : existing[0].fm_code;

    await pool.query(
      `UPDATE parts SET serial_no = ?, part_no = ?, kubota_part_no = ?, description = ?, quantity = ?, fm_code = ?
       WHERE id = ?`,
      [
        updatedSerial,
        updatedPartNo,
        updatedKubota,
        updatedDesc,
        updatedQty,
        updatedFm,
        uuidToBuffer(id),
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, serial_no, part_no, kubota_part_no, description, quantity, fm_code, created_at FROM parts WHERE id = ?',
      [uuidToBuffer(id)]
    );

    const part = convertRow(rows[0], PART_FIELDS);

    res.json({ success: true, part });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/hotspots/:coordinate_id
 * Update a hotspot's x/y position on a diagram.
 */
export async function updateHotspot(req, res, next) {
  try {
    const { coordinate_id } = req.params;
    validateUUID(coordinate_id, 'coordinate_id');

    const { x_coordinate, y_coordinate, radius } = req.body;

    validateRequired(req.body, ['x_coordinate', 'y_coordinate']);
    validateCoordinate(x_coordinate, 'x_coordinate');
    validateCoordinate(y_coordinate, 'y_coordinate');

    const [existing] = await pool.query(
      'SELECT id, radius FROM image_coordinates WHERE id = ?',
      [uuidToBuffer(coordinate_id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('PART_NOT_FOUND', 'Hotspot not found');
    }

    const finalRadius = radius !== undefined ? parseInt(radius, 10) : existing[0].radius;

    await pool.query(
      'UPDATE image_coordinates SET x_coordinate = ?, y_coordinate = ?, radius = ? WHERE id = ?',
      [parseFloat(x_coordinate), parseFloat(y_coordinate), finalRadius, uuidToBuffer(coordinate_id)]
    );

    const [rows] = await pool.query(
      'SELECT id, part_id, image_id, x_coordinate, y_coordinate, radius, created_at FROM image_coordinates WHERE id = ?',
      [uuidToBuffer(coordinate_id)]
    );

    const coordinate = convertRow(rows[0], COORD_FIELDS);

    res.json({ success: true, coordinate });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/parts/:id
 * Delete a part. Cascades to all its hotspots (image_coordinates).
 */
export async function deletePart(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [existing] = await pool.query(
      'SELECT id FROM parts WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('PART_NOT_FOUND', 'Part not found');
    }

    await pool.query('DELETE FROM parts WHERE id = ?', [uuidToBuffer(id)]);

    res.json({ success: true, message: 'Part deleted' });
  } catch (err) {
    next(err);
  }
}




// /**
//  * Part controller.
//  * CRUD operations for parts and hotspot (image coordinate) management.
//  */
// import pool from '../config/database.js';
// import { generateUUID, uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
// import {
//   validateRequired,
//   validateUUID,
//   validateCoordinate,
// } from '../utils/validators.js';
// import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

// const PART_FIELDS = ['id'];
// const COORD_FIELDS = ['id', 'part_id', 'image_id'];

// /**
//  * POST /api/admin/parts
//  * Create a part with an optional hotspot on a diagram.
//  * If image_id is provided WITHOUT x_coordinate/y_coordinate, the part is
//  * linked to the diagram as an "extra part" with no visible hotspot dot.
//  */
// export async function createPart(req, res, next) {
//   try {
//     const {
//       serial_no,
//       part_no,
//       kubota_part_no,
//       description,
//       quantity,
//       fm_code,
//       image_id,
//       x_coordinate,
//       y_coordinate,
//       radius,
//     } = req.body;

//     validateRequired(req.body, ['part_no']);

//     const partId = generateUUID();
//     const qty = quantity !== undefined ? parseInt(quantity, 10) : 1;

//     let finalSerialNo = serial_no || null;

//     // Auto-assign sequential serial_no when creating a hotspot on a diagram
//     if (image_id && !finalSerialNo) {
//       const [maxRows] = await pool.query(
//         `SELECT COUNT(*) AS cnt FROM image_coordinates WHERE image_id = ?`,
//         [uuidToBuffer(image_id)]
//       );
//       finalSerialNo = String(maxRows[0].cnt + 1);
//     }

//     await pool.query(
//       `INSERT INTO parts (id, serial_no, part_no, kubota_part_no, description, quantity, fm_code)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         uuidToBuffer(partId),
//         finalSerialNo,
//         part_no,
//         kubota_part_no || null,
//         description || null,
//         qty,
//         fm_code || null,
//       ]
//     );

//     const [partRows] = await pool.query(
//       'SELECT id, serial_no, part_no, kubota_part_no, description, quantity, fm_code, created_at FROM parts WHERE id = ?',
//       [uuidToBuffer(partId)]
//     );

//     const part = convertRow(partRows[0], PART_FIELDS);

//     let coordinate = null;

//     // If image_id provided, link the part to this diagram.
//     // Coordinates are OPTIONAL — omitting them creates an "extra part"
//     // (linked to the diagram/section, but with no hotspot dot on the image).
//     if (image_id) {
//       validateUUID(image_id, 'image_id');

//       // Verify image exists
//       const [imageCheck] = await pool.query(
//         'SELECT id FROM images WHERE id = ?',
//         [uuidToBuffer(image_id)]
//       );

//       if (imageCheck.length === 0) {
//         throw new NotFoundError('IMAGE_NOT_FOUND', 'Diagram not found');
//       }

//       // Check for unique constraint (part_id, image_id)
//       const [existingCoord] = await pool.query(
//         'SELECT id FROM image_coordinates WHERE part_id = ? AND image_id = ?',
//         [uuidToBuffer(partId), uuidToBuffer(image_id)]
//       );

//       if (existingCoord.length > 0) {
//         throw new ConflictError('CONFLICT', 'A hotspot for this part and image already exists');
//       }

//       const hasPosition = x_coordinate !== undefined && y_coordinate !== undefined;

//       let xVal = null;
//       let yVal = null;
//       let finalRadius = radius !== undefined ? parseInt(radius, 10) : 14;

//       if (hasPosition) {
//         validateCoordinate(x_coordinate, 'x_coordinate');
//         validateCoordinate(y_coordinate, 'y_coordinate');
//         xVal = parseFloat(x_coordinate);
//         yVal = parseFloat(y_coordinate);
//         // finalRadius = radius !== undefined ? parseInt(radius, 10) : 14;
//       }

//       const coordId = generateUUID();
//       await pool.query(
//         `INSERT INTO image_coordinates (id, part_id, image_id, x_coordinate, y_coordinate, radius)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           uuidToBuffer(coordId),
//           uuidToBuffer(partId),
//           uuidToBuffer(image_id),
//           xVal,
//           yVal,
//           finalRadius,
//         ]
//       );

//       const [coordRows] = await pool.query(
//         'SELECT id, part_id, image_id, x_coordinate, y_coordinate, radius, created_at FROM image_coordinates WHERE id = ?',
//         [uuidToBuffer(coordId)]
//       );

//       coordinate = convertRow(coordRows[0], COORD_FIELDS);
//     }

//     res.status(201).json({ success: true, part, coordinate });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * GET /api/admin/parts?image_id=uuid (auth)
//  * GET /api/diagrams/:id/parts (public)
//  * Get all parts for a given diagram (image), including parts that have
//  * no hotspot position (extra parts). Parts WITH a hotspot include their
//  * x/y/radius under `coordinate`; parts without one have `coordinate: null`.
//  */
// export async function getPartsByImage(req, res, next) {
//   try {
//     let imageId;

//     if (req.params.id) {
//       imageId = req.params.id;
//     } else {
//       imageId = req.query.image_id;
//     }

//     if (!imageId) {
//       throw new BadRequestError('INVALID_INPUT', 'image_id is required');
//     }
//     validateUUID(imageId, 'image_id');

//     const [rows] = await pool.query(
//       `SELECT p.id, p.serial_no, p.part_no, p.kubota_part_no, p.description, p.quantity, p.fm_code, p.created_at,
//               ic.id AS coord_id, ic.x_coordinate, ic.y_coordinate, ic.radius
//        FROM parts p
//        LEFT JOIN image_coordinates ic ON ic.part_id = p.id AND ic.image_id = ?
//        WHERE ic.image_id = ?
//        ORDER BY CAST(p.serial_no AS UNSIGNED) ASC`,
//       [uuidToBuffer(imageId), uuidToBuffer(imageId)]
//     );

//     const parts = rows.map((r) => {
//       const part = convertRow(r, PART_FIELDS);
//       const hasPosition = r.x_coordinate !== null && r.y_coordinate !== null;
//       part.coordinate = hasPosition
//         ? {
//             id: bufferToUuid(r.coord_id),
//             x_coordinate: parseFloat(r.x_coordinate),
//             y_coordinate: parseFloat(r.y_coordinate),
//             radius: r.radius !== null && r.radius !== undefined ? parseInt(r.radius, 10) : 14,
//           }
//         : null;
//       return part;
//     });

//     res.json({ success: true, parts });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * PUT /api/admin/parts/:id
//  * Update a part's fields (no hotspot update here).
//  */
// export async function updatePart(req, res, next) {
//   try {
//     const { id } = req.params;
//     validateUUID(id, 'id');

//     const {
//       serial_no,
//       part_no,
//       kubota_part_no,
//       description,
//       quantity,
//       fm_code,
//     } = req.body;

//     const [existing] = await pool.query(
//       'SELECT id, serial_no, part_no, kubota_part_no, description, quantity, fm_code FROM parts WHERE id = ?',
//       [uuidToBuffer(id)]
//     );

//     if (existing.length === 0) {
//       throw new NotFoundError('PART_NOT_FOUND', 'Part not found');
//     }

//     const updatedSerial = serial_no !== undefined ? serial_no : existing[0].serial_no;
//     const updatedPartNo = part_no || existing[0].part_no;
//     const updatedKubota = kubota_part_no !== undefined ? kubota_part_no : existing[0].kubota_part_no;
//     const updatedDesc = description !== undefined ? description : existing[0].description;
//     const updatedQty = quantity !== undefined ? parseInt(quantity, 10) : existing[0].quantity;
//     const updatedFm = fm_code !== undefined ? fm_code : existing[0].fm_code;

//     await pool.query(
//       `UPDATE parts SET serial_no = ?, part_no = ?, kubota_part_no = ?, description = ?, quantity = ?, fm_code = ?
//        WHERE id = ?`,
//       [
//         updatedSerial,
//         updatedPartNo,
//         updatedKubota,
//         updatedDesc,
//         updatedQty,
//         updatedFm,
//         uuidToBuffer(id),
//       ]
//     );

//     const [rows] = await pool.query(
//       'SELECT id, serial_no, part_no, kubota_part_no, description, quantity, fm_code, created_at FROM parts WHERE id = ?',
//       [uuidToBuffer(id)]
//     );

//     const part = convertRow(rows[0], PART_FIELDS);

//     res.json({ success: true, part });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * PUT /api/admin/hotspots/:coordinate_id
//  * Update a hotspot's x/y position on a diagram.
//  */
// export async function updateHotspot(req, res, next) {
//   try {
//     const { coordinate_id } = req.params;
//     validateUUID(coordinate_id, 'coordinate_id');

//     const { x_coordinate, y_coordinate, radius } = req.body;

//     validateRequired(req.body, ['x_coordinate', 'y_coordinate']);
//     validateCoordinate(x_coordinate, 'x_coordinate');
//     validateCoordinate(y_coordinate, 'y_coordinate');

//     const [existing] = await pool.query(
//       'SELECT id, radius FROM image_coordinates WHERE id = ?',
//       [uuidToBuffer(coordinate_id)]
//     );

//     if (existing.length === 0) {
//       throw new NotFoundError('PART_NOT_FOUND', 'Hotspot not found');
//     }

//     const finalRadius = radius !== undefined ? parseInt(radius, 10) : existing[0].radius;

//     await pool.query(
//       'UPDATE image_coordinates SET x_coordinate = ?, y_coordinate = ?, radius = ? WHERE id = ?',
//       [parseFloat(x_coordinate), parseFloat(y_coordinate), finalRadius, uuidToBuffer(coordinate_id)]
//     );

//     const [rows] = await pool.query(
//       'SELECT id, part_id, image_id, x_coordinate, y_coordinate, radius, created_at FROM image_coordinates WHERE id = ?',
//       [uuidToBuffer(coordinate_id)]
//     );

//     const coordinate = convertRow(rows[0], COORD_FIELDS);

//     res.json({ success: true, coordinate });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * DELETE /api/admin/parts/:id
//  * Delete a part. Cascades to all its hotspots (image_coordinates).
//  */
// export async function deletePart(req, res, next) {
//   try {
//     const { id } = req.params;
//     validateUUID(id, 'id');

//     const [existing] = await pool.query(
//       'SELECT id FROM parts WHERE id = ?',
//       [uuidToBuffer(id)]
//     );

//     if (existing.length === 0) {
//       throw new NotFoundError('PART_NOT_FOUND', 'Part not found');
//     }

//     await pool.query('DELETE FROM parts WHERE id = ?', [uuidToBuffer(id)]);

//     res.json({ success: true, message: 'Part deleted' });
//   } catch (err) {
//     next(err);
//   }
// }