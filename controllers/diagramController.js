/**
 * Diagram (image) controller.
 * Handles upload, retrieval, and deletion of section/subsection diagrams.
 */
import pool from '../config/database.js';
import s3 from '../utils/utils/s3.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { generateUUID, uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
import { validateRequired, validateUUID } from '../utils/validators.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const IMAGE_FIELDS = ['id', 'section_id'];

/**
 * POST /api/admin/diagrams
 * Upload a new diagram for a section. Adds to existing diagrams — does not delete them.
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

    // Insert new image record (existing diagrams for this section are kept as-is)
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
 * Get all diagrams for a section, newest first. `image` (most recent) kept for backward compatibility.
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
      'SELECT id, section_id, image_path, created_at FROM images WHERE section_id = ? ORDER BY created_at DESC',
      [uuidToBuffer(sectionId)]
    );

    if (rows.length === 0) {
      return res.json({ success: true, image: null, diagrams: [] });
    }

    const diagrams = rows.map((row) => convertRow(row, IMAGE_FIELDS));

    res.json({ success: true, image: diagrams[0], diagrams });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/diagrams/:id
 * Delete a single diagram by image ID. Removes S3 object and DB record.
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
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }));
    }

    await pool.query('DELETE FROM images WHERE id = ?', [uuidToBuffer(id)]);

    res.json({ success: true, message: 'Diagram deleted' });
  } catch (err) {
    next(err);
  }
}