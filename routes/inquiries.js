/**
 * Inquiry routes.
 * Public route for creating inquiries, admin routes (auth required) for management.
 */
import express from 'express';
import auth from '../middleware/auth.js';
import {
  createInquiry,
  getInquiries,
  getInquiry,
  updateInquiry,
  deleteInquiry,
} from '../controllers/inquiryController.js';

const router = express.Router();

// Public route (no auth) - create inquiry
router.post('/', createInquiry);

// Admin routes (auth required)
router.get('/', auth, getInquiries);
router.get('/:id', auth, getInquiry);
router.put('/:id', auth, updateInquiry);
router.delete('/:id', auth, deleteInquiry);

export default router;
