/**
 * Section controller.
 * CRUD operations for main sections and subsections (hierarchical via parent_id).
 */
import pool from '../config/database.js';
import { generateUUID, uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
import { validateRequired, validateUUID } from '../utils/validators.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const SECTION_FIELDS = ['id', 'harvester_id', 'parent_id'];

/**
 * GET /api/admin/sections?harvester_id=uuid&parent_only=true
 * Get sections by harvester. If parent_only=true, only main sections (parent_id IS NULL).
 * Main sections include their subsections nested.
 */
export async function getSections(req, res, next) {
  try {
    const { harvester_id, parent_only } = req.query;

    if (!harvester_id) {
      throw new BadRequestError('INVALID_INPUT', 'harvester_id query parameter is required');
    }
    validateUUID(harvester_id, 'harvester_id');

    const onlyParents = parent_only === 'true' || parent_only === true;

    let mainSections;
    if (onlyParents) {
      [mainSections] = await pool.query(
        `SELECT id, harvester_id, parent_id, name, icon, created_at
         FROM sections
         WHERE harvester_id = ? AND parent_id IS NULL
         ORDER BY created_at ASC`,
        [uuidToBuffer(harvester_id)]
      );
    } else {
      [mainSections] = await pool.query(
        `SELECT id, harvester_id, parent_id, name, icon, created_at
         FROM sections
         WHERE harvester_id = ?
         ORDER BY created_at ASC`,
        [uuidToBuffer(harvester_id)]
      );
    }

    // Fetch subsections for each main section
    const sectionsWithSubs = [];
    for (const section of mainSections) {
      const converted = convertRow(section, SECTION_FIELDS);
      const [subsections] = await pool.query(
        `SELECT id, harvester_id, parent_id, name, icon, created_at
         FROM sections
         WHERE parent_id = ?
         ORDER BY created_at ASC`,
        [section.id]
      );
      converted.subsections = subsections.map((s) => convertRow(s, SECTION_FIELDS));
      sectionsWithSubs.push(converted);
    }

    res.json({ success: true, sections: sectionsWithSubs });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/sections/:id
 * Get a single section with its subsections.
 */
export async function getSection(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      `SELECT id, harvester_id, parent_id, name, icon, created_at
       FROM sections WHERE id = ?`,
      [uuidToBuffer(id)]
    );

    if (rows.length === 0) {
      throw new NotFoundError('SECTION_NOT_FOUND', 'Section not found');
    }

    const section = convertRow(rows[0], SECTION_FIELDS);

    const [subsections] = await pool.query(
      `SELECT id, harvester_id, parent_id, name, icon, created_at
       FROM sections WHERE parent_id = ?
       ORDER BY created_at ASC`,
      [uuidToBuffer(id)]
    );

    section.subsections = subsections.map((s) => convertRow(s, SECTION_FIELDS));

    res.json({ success: true, section });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/sections/:id/subsections (public)
 * Get subsections for a given section.
 */
export async function getSubsections(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      `SELECT id, harvester_id, parent_id, name, icon, created_at
       FROM sections WHERE parent_id = ?
       ORDER BY created_at ASC`,
      [uuidToBuffer(id)]
    );

    const subsections = rows.map((s) => convertRow(s, SECTION_FIELDS));

    res.json({ success: true, subsections });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/sections
 * Create a new section (main section if parent_id is null, subsection otherwise).
 */
export async function createSection(req, res, next) {
  try {
    const { name, harvester_id, parent_id, icon } = req.body;

    validateRequired(req.body, ['name', 'harvester_id']);
    validateUUID(harvester_id, 'harvester_id');

    if (parent_id) {
      validateUUID(parent_id, 'parent_id');
    }

    // Verify harvester exists
    const [harvesterCheck] = await pool.query(
      'SELECT id FROM harvesters WHERE id = ?',
      [uuidToBuffer(harvester_id)]
    );

    if (harvesterCheck.length === 0) {
      throw new NotFoundError('HARVESTER_NOT_FOUND', 'Harvester not found');
    }

    // If parent_id provided, verify it exists
    if (parent_id) {
      const [parentCheck] = await pool.query(
        'SELECT id FROM sections WHERE id = ?',
        [uuidToBuffer(parent_id)]
      );

      if (parentCheck.length === 0) {
        throw new NotFoundError('SECTION_NOT_FOUND', 'Parent section not found');
      }
    }

    const id = generateUUID();

    await pool.query(
      `INSERT INTO sections (id, harvester_id, parent_id, name, icon)
       VALUES (?, ?, ?, ?, ?)`,
      [
        uuidToBuffer(id),
        uuidToBuffer(harvester_id),
        parent_id ? uuidToBuffer(parent_id) : null,
        name,
        icon || null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, harvester_id, parent_id, name, icon, created_at
       FROM sections WHERE id = ?`,
      [uuidToBuffer(id)]
    );

    const section = convertRow(rows[0], SECTION_FIELDS);

    res.status(201).json({ success: true, section });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/sections/:id
 * Update a section's name and icon.
 */
export async function updateSection(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const { name, icon } = req.body;

    const [existing] = await pool.query(
      'SELECT id, name, icon FROM sections WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('SECTION_NOT_FOUND', 'Section not found');
    }

    const newName = name || existing[0].name;
    const newIcon = icon !== undefined ? icon : existing[0].icon;

    await pool.query(
      'UPDATE sections SET name = ?, icon = ? WHERE id = ?',
      [newName, newIcon, uuidToBuffer(id)]
    );

    const [rows] = await pool.query(
      `SELECT id, harvester_id, parent_id, name, icon, created_at
       FROM sections WHERE id = ?`,
      [uuidToBuffer(id)]
    );

    const section = convertRow(rows[0], SECTION_FIELDS);

    res.json({ success: true, section });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/sections/:id
 * Delete a section. Cascades to subsections, diagrams, and hotspots.
 */
export async function deleteSection(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [existing] = await pool.query(
      'SELECT id FROM sections WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('SECTION_NOT_FOUND', 'Section not found');
    }

    await pool.query('DELETE FROM sections WHERE id = ?', [uuidToBuffer(id)]);

    res.json({ success: true, message: 'Section deleted' });
  } catch (err) {
    next(err);
  }
}
