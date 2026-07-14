/**
 * Harvester controller.
 * CRUD operations for harvesters (heavy equipment catalog entries).
 */
import pool from '../config/database.js';
import { generateUUID, uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
import { validateRequired, validateUUID } from '../utils/validators.js';
import { NotFoundError } from '../utils/errors.js';

const HARVESTER_FIELDS = ['id'];

/**
 * GET /api/harvesters (public) or GET /api/admin/harvesters (auth)
 * Get all harvesters.
 */
export async function getAllHarvesters(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, image_url, created_at FROM harvesters ORDER BY created_at DESC'
    );

    const harvesters = rows.map((r) => convertRow(r, HARVESTER_FIELDS));

    res.json({ success: true, harvesters });
  } catch (err) {
  console.error(err);
  next(err);
}
}
/**
 * GET /api/harvesters/:id (public) or GET /api/admin/harvesters/:id (auth)
 * Get a single harvester by ID.
 */
export async function getHarvester(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      'SELECT id, name, image_url, created_at FROM harvesters WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (rows.length === 0) {
      throw new NotFoundError('HARVESTER_NOT_FOUND', 'Harvester not found');
    }

    const harvester = convertRow(rows[0], HARVESTER_FIELDS);

    res.json({ success: true, harvester });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/harvesters
 * Create a new harvester. Accepts multipart/form-data with name and optional image.
 */
export async function createHarvester(req, res, next) {
  try {
    const { name } = req.body;
    validateRequired(req.body, ['name']);

    const id = generateUUID();
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/harvesters/${req.file.filename}`;
    }

    await pool.query(
      'INSERT INTO harvesters (id, name, image_url) VALUES (?, ?, ?)',
      [uuidToBuffer(id), name, imageUrl]
    );

    const [rows] = await pool.query(
      'SELECT id, name, image_url, created_at FROM harvesters WHERE id = ?',
      [uuidToBuffer(id)]
    );

    const harvester = convertRow(rows[0], HARVESTER_FIELDS);

    res.status(201).json({ success: true, harvester });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/harvesters/:id
 * Update a harvester. Accepts multipart/form-data with name and optional image.
 */
export async function updateHarvester(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [existing] = await pool.query(
      'SELECT id, name, image_url FROM harvesters WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('HARVESTER_NOT_FOUND', 'Harvester not found');
    }

    const name = req.body.name || existing[0].name;
    let imageUrl = existing[0].image_url;

    if (req.file) {
      imageUrl = `/uploads/harvesters/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE harvesters SET name = ?, image_url = ? WHERE id = ?',
      [name, imageUrl, uuidToBuffer(id)]
    );

    const [rows] = await pool.query(
      'SELECT id, name, image_url, created_at FROM harvesters WHERE id = ?',
      [uuidToBuffer(id)]
    );

    const harvester = convertRow(rows[0], HARVESTER_FIELDS);

    res.json({ success: true, harvester });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/harvesters/:id
 * Delete a harvester. Cascades to sections, diagrams, parts, inquiries.
 */
export async function deleteHarvester(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [existing] = await pool.query(
      'SELECT id FROM harvesters WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('HARVESTER_NOT_FOUND', 'Harvester not found');
    }

    await pool.query('DELETE FROM harvesters WHERE id = ?', [uuidToBuffer(id)]);

    res.json({ success: true, message: 'Harvester deleted' });
  } catch (err) {
    next(err);
  }
}