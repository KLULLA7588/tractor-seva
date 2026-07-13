/**
 * Inquiry controller.
 * Handles customer inquiries (public create, admin CRUD).
 */
import pool from '../config/database.js';
import { generateUUID, uuidToBuffer, bufferToUuid, convertRow } from '../utils/uuid.js';
import {
  validateRequired,
  validateUUID,
  validateEmail,
  validateInquiryStatus,
} from '../utils/validators.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const INQUIRY_FIELDS = ['id', 'part_id'];

/**
 * POST /api/inquiries (public, no auth)
 * Create a new inquiry from a customer.
 */
export async function createInquiry(req, res, next) {
  try {
    const {
      part_id,
      part_name,
      part_no,
      customer_name,
      phone_number,
      email_address,
      message,
    } = req.body;

    validateRequired(req.body, ['customer_name', 'email_address']);
    validateEmail(email_address);

    if (part_id) {
      validateUUID(part_id, 'part_id');
    }

    const id = generateUUID();

    await pool.query(
      `INSERT INTO inquiries (id, part_id, part_name, part_no, customer_name, phone_number, email_address, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
      [
        uuidToBuffer(id),
        part_id ? uuidToBuffer(part_id) : null,
        part_name || null,
        part_no || null,
        customer_name,
        phone_number || null,
        email_address,
        message || null,
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, part_id, status, created_at FROM inquiries WHERE id = ?',
      [uuidToBuffer(id)]
    );

    const inquiry = convertRow(rows[0], INQUIRY_FIELDS);

    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/inquiries?status=New&search=customer_name
 * Get all inquiries with optional filtering by status and search.
 */
export async function getInquiries(req, res, next) {
  try {
    const { status, search } = req.query;

    let query = 'SELECT id, part_id, part_name, part_no, customer_name, phone_number, email_address, message, status, created_at, updated_at FROM inquiries';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(customer_name LIKE ? OR phone_number LIKE ? OR part_no LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    const inquiries = rows.map((r) => convertRow(r, INQUIRY_FIELDS));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM inquiries';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    res.json({ success: true, inquiries, total });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/inquiries/:id
 * Get a single inquiry by ID.
 */
export async function getInquiry(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [rows] = await pool.query(
      'SELECT id, part_id, part_name, part_no, customer_name, phone_number, email_address, message, status, created_at, updated_at FROM inquiries WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (rows.length === 0) {
      throw new NotFoundError('INQUIRY_NOT_FOUND', 'Inquiry not found');
    }

    const inquiry = convertRow(rows[0], INQUIRY_FIELDS);

    res.json({ success: true, inquiry });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/inquiries/:id
 * Update an inquiry's status.
 */
export async function updateInquiry(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const { status } = req.body;
    validateRequired(req.body, ['status']);
    validateInquiryStatus(status);

    const [existing] = await pool.query(
      'SELECT id FROM inquiries WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('INQUIRY_NOT_FOUND', 'Inquiry not found');
    }

    await pool.query(
      'UPDATE inquiries SET status = ? WHERE id = ?',
      [status, uuidToBuffer(id)]
    );

    const [rows] = await pool.query(
      'SELECT id, part_id, part_name, part_no, customer_name, phone_number, email_address, message, status, created_at, updated_at FROM inquiries WHERE id = ?',
      [uuidToBuffer(id)]
    );

    const inquiry = convertRow(rows[0], INQUIRY_FIELDS);

    res.json({ success: true, inquiry });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/inquiries/:id
 * Delete an inquiry.
 */
export async function deleteInquiry(req, res, next) {
  try {
    const { id } = req.params;
    validateUUID(id, 'id');

    const [existing] = await pool.query(
      'SELECT id FROM inquiries WHERE id = ?',
      [uuidToBuffer(id)]
    );

    if (existing.length === 0) {
      throw new NotFoundError('INQUIRY_NOT_FOUND', 'Inquiry not found');
    }

    await pool.query('DELETE FROM inquiries WHERE id = ?', [uuidToBuffer(id)]);

    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    next(err);
  }
}
