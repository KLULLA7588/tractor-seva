/**
 * Diagram (image) controller.
 * Handles upload, retrieval, and deletion of section/subsection diagrams.
 */
import pool from '../config/database.js';
import s3 from '../utils/utils/s3.js';
import { generateUUID, uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
import { validateRequired, validateUUID } from '../utils/validators.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const IMAGE_FIELDS = ['id', 'section_id'];

/**
 * POST /api/admin/diagrams
 * Upload or update a diagram for a section.
 * Deletes existing diagram (file + record) for the section if one exists.
 */
export async function uploadDiagram(req, res, next) {
  try {
    const { section_id } = req.body;

    validateRequired(req.body, ['section_id']);
    validateUUID(section_id, 'section_id');

    if (!req.file) {
      throw new BadRequestError('INVALID_FILE', 'Image file is required');
    }

    // Verify section exists
    const [sectionCheck] = await pool.query(
      'SELECT id FROM sections WHERE id = ?',
      [uuidToBuffer(section_id)]
    );

    if (sectionCheck.length === 0) {
      throw new NotFoundError('SECTION_NOT_FOUND', 'Section not found');
    }

    // Delete existing diagram for this section (S3 object + record)
    const [existing] = await pool.query(
      'SELECT id, image_path FROM images WHERE section_id = ?',
      [uuidToBuffer(section_id)]
    );

    if (existing.length > 0) {
      // Delete old file from S3
      for (const img of existing) {
        const key = img.image_path.split('.amazonaws.com/')[1];
        if (key) {
          await s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          }).promise();
        }
      }
      // Delete old DB record
      await pool.query('DELETE FROM images WHERE section_id = ?', [uuidToBuffer(section_id)]);
    }

    // Insert new image record
    const id = generateUUID();
    const imagePath = req.file.location;

    await pool.query(
      'INSERT INTO images (id, section_id, image_path) VALUES (?, ?, ?)',
      [uuidToBuffer(id), uuidToBuffer(section_id), imagePath]
    );

    const [rows] = await pool.query(
      'SELECT id, section_id, image_path, created_at FROM images WHERE id = ?',
      [uuidToBuffer(id)]
    );

    const image = convertRow(rows[0], IMAGE_FIELDS);

    res.status(201).json({ success: true, image });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/diagrams?section_id=uuid (auth)
 * GET /api/sections/:id/diagram (public)
 * Get the diagram for a section. Returns null image if none exists.
 */
export async function getDiagram(req, res, next) {
  try {
    let sectionId;

    // Public route uses params, admin route uses query
    if (req.params.id) {
      sectionId = req.params.id;
    } else {
      sectionId = req.query.section_id;
    }

    if (!sectionId) {
      throw new BadRequestError('INVALID_INPUT', 'section_id is required');
    }
    validateUUID(sectionId, 'section_id');

    const [rows] = await pool.query(
      'SELECT id, section_id, image_path, created_at FROM images WHERE section_id = ?',
      [uuidToBuffer(sectionId)]
    );

    if (rows.length === 0) {
      return res.json({ success: true, image: null });
    }

    const image = convertRow(rows[0], IMAGE_FIELDS);

    res.json({ success: true, image });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/diagrams/:id
 * Delete a diagram by image ID. Removes S3 object and DB record.
 */
export async function deleteDiagram(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      'SELECT id, image_path FROM images WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (rows.length === 0) {
      throw new NotFoundError('IMAGE_NOT_FOUND', 'Diagram not found');
    }

    // Delete file from S3
    const key = rows[0].image_path.split('.amazonaws.com/')[1];
    if (key) {
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }).promise();
    }

    await pool.query('DELETE FROM images WHERE id = ?', [uuidToBuffer(id)]);

    res.json({ success: true, message: 'Diagram deleted' });
  } catch (err) {
    next(err);
  }
}