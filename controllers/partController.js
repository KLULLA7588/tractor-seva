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

    // If image_id and coordinates provided, create a hotspot
    if (image_id && x_coordinate !== undefined && y_coordinate !== undefined) {
      validateUUID(image_id, 'image_id');
      validateCoordinate(x_coordinate, 'x_coordinate');
      validateCoordinate(y_coordinate, 'y_coordinate');

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

      const coordId = generateUUID();
      await pool.query(
        `INSERT INTO image_coordinates (id, part_id, image_id, x_coordinate, y_coordinate)
         VALUES (?, ?, ?, ?, ?)`,
        [
          uuidToBuffer(coordId),
          uuidToBuffer(partId),
          uuidToBuffer(image_id),
          parseFloat(x_coordinate),
          parseFloat(y_coordinate),
        ]
      );

      const [coordRows] = await pool.query(
        'SELECT id, part_id, image_id, x_coordinate, y_coordinate, created_at FROM image_coordinates WHERE id = ?',
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
 * GET /api/admin/parts?image_id=uuid (auth)
 * GET /api/diagrams/:id/parts (public)
 * Get all parts with their hotspot coordinates for a given diagram (image).
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
              ic.id AS coord_id, ic.x_coordinate, ic.y_coordinate
       FROM parts p
       INNER JOIN image_coordinates ic ON ic.part_id = p.id
       WHERE ic.image_id = ?
       ORDER BY p.serial_no ASC`,
      [uuidToBuffer(imageId)]
    );

    const parts = rows.map((r) => {
      const part = convertRow(r, PART_FIELDS);
      part.coordinate = {
        id: bufferToUuid(r.coord_id),
        x_coordinate: parseFloat(r.x_coordinate),
        y_coordinate: parseFloat(r.y_coordinate),
      };
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

    const { x_coordinate, y_coordinate } = req.body;

    validateRequired(req.body, ['x_coordinate', 'y_coordinate']);
    validateCoordinate(x_coordinate, 'x_coordinate');
    validateCoordinate(y_coordinate, 'y_coordinate');

    const [existing] = await pool.query(
      'SELECT id FROM image_coordinates WHERE id = ?',
      [uuidToBuffer(coordinate_id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('PART_NOT_FOUND', 'Hotspot not found');
    }

    await pool.query(
      'UPDATE image_coordinates SET x_coordinate = ?, y_coordinate = ? WHERE id = ?',
      [parseFloat(x_coordinate), parseFloat(y_coordinate), uuidToBuffer(coordinate_id)]
    );

    const [rows] = await pool.query(
      'SELECT id, part_id, image_id, x_coordinate, y_coordinate, created_at FROM image_coordinates WHERE id = ?',
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
