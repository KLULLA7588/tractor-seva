/**
 * Public routes (no auth required).
 * Read-only catalog endpoints for the public-facing frontend.
 */
import express from 'express';
import pool from '../config/database.js';
import { uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
import { validateUUID } from '../utils/validators.js';
import { NotFoundError } from '../utils/errors.js';

const router = express.Router();

const HARVESTER_FIELDS = ['id'];
const SECTION_FIELDS = ['id', 'harvester_id', 'parent_id'];
const IMAGE_FIELDS = ['id', 'section_id'];
const PART_FIELDS = ['id'];

/**
 * GET /api/harvesters
 * Get all harvesters (public catalog).
 */
router.get('/harvesters', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, image_url, created_at FROM harvesters ORDER BY created_at DESC'
    );
    const harvesters = rows.map((r) => convertRow(r, HARVESTER_FIELDS));
    res.json({ success: true, harvesters });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/harvesters/:id/sections?parent_only=true
 * Get sections for a harvester (public).
 */
router.get('/harvesters/:id/sections', async (req, res, next) => {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');
    const onlyParents = req.query.parent_only === 'true' || req.query.parent_only === true;

    let mainSections;
    if (onlyParents) {
      [mainSections] = await pool.query(
        `SELECT id, harvester_id, parent_id, name, icon, created_at
         FROM sections WHERE harvester_id = ? AND parent_id IS NULL ORDER BY created_at ASC`,
        [uuidToBuffer(id)]
      );
    } else {
      [mainSections] = await pool.query(
        `SELECT id, harvester_id, parent_id, name, icon, created_at
         FROM sections WHERE harvester_id = ? ORDER BY created_at ASC`,
        [uuidToBuffer(id)]
      );
    }

    const sectionsWithSubs = [];
    for (const section of mainSections) {
      const converted = convertRow(section, SECTION_FIELDS);
      const [subsections] = await pool.query(
        `SELECT id, harvester_id, parent_id, name, icon, created_at
         FROM sections WHERE parent_id = ? ORDER BY created_at ASC`,
        [section.id]
      );
      converted.subsections = subsections.map((s) => convertRow(s, SECTION_FIELDS));
      sectionsWithSubs.push(converted);
    }

    res.json({ success: true, sections: sectionsWithSubs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/sections/:id/diagram
 * Get all diagrams for a section (public).
 */
router.get('/sections/:id/diagram', async (req, res, next) => {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      'SELECT id, section_id, image_path, created_at FROM images WHERE section_id = ? ORDER BY created_at ASC',
      [uuidToBuffer(id)]
    );

    if (rows.length === 0) {
      return res.json({ success: true, image: null, diagrams: [] });
    }

    const diagrams = rows.map((row) => convertRow(row, IMAGE_FIELDS));
    res.json({ success: true, image: diagrams[0], diagrams });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/sections/:id/diagram
 * Get the diagram for a section (public).
 */
router.get('/sections/:id/diagram', async (req, res, next) => {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      'SELECT id, section_id, image_path, created_at FROM images WHERE section_id = ?',
      [uuidToBuffer(id)]
    );

    if (rows.length === 0) {
      return res.json({ success: true, image: null });
    }

    const image = convertRow(rows[0], IMAGE_FIELDS);
    res.json({ success: true, image });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/diagrams/:id/parts
 * Get all parts with hotspots for a diagram (public).
 */
router.get('/diagrams/:id/parts', async (req, res, next) => {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      `SELECT p.id, p.serial_no, p.part_no, p.kubota_part_no, p.description, p.quantity, p.fm_code, p.created_at,
              ic.id AS coord_id, ic.x_coordinate, ic.y_coordinate, ic.radius
       FROM parts p
       INNER JOIN image_coordinates ic ON ic.part_id = p.id
       WHERE ic.image_id = ?
       ORDER BY CAST(p.serial_no AS UNSIGNED) ASC`,
      [uuidToBuffer(id)]
    );

    const parts = rows.map((r) => {
      const part = convertRow(r, PART_FIELDS);
      part.coordinate = {
        id: bufferToUuid(r.coord_id),
        x_coordinate: parseFloat(r.x_coordinate),
        y_coordinate: parseFloat(r.y_coordinate),
        radius: r.radius !== null && r.radius !== undefined ? parseInt(r.radius, 10) : 14,
      };
      return part;
    });

    res.json({ success: true, parts });
  } catch (err) {
    next(err);
  }
});

export default router;