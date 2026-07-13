/**
 * Section routes.
 * Admin routes (auth required) and public routes.
 */
import express from 'express';
import auth from '../middleware/auth.js';
import {
  getSections,
  getSection,
  getSubsections,
  createSection,
  updateSection,
  deleteSection,
} from '../controllers/sectionController.js';

const router = express.Router();

// PUBLIC routes (no auth required)
router.get('/', getSections);
router.get('/:id', getSection);

// ADMIN routes (auth required)
router.post('/', auth, createSection);
router.put('/:id', auth, updateSection);
router.delete('/:id', auth, deleteSection);

export default router;