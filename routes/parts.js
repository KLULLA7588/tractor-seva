/**
 * Part routes.
 * Admin routes (auth required) for parts and hotspots management.
 */
import express from 'express';
import auth from '../middleware/auth.js';
import {
  createPart,
  getPartsByImage,
  updatePart,
  updateHotspot,
  deletePart,
} from '../controllers/partController.js';

const router = express.Router();

// Admin routes (auth required)
router.get('/', auth, getPartsByImage);
router.post('/', auth, createPart);
router.put('/hotspots/:coordinate_id', auth, updateHotspot);
router.put('/:id', auth, updatePart);
router.delete('/:id', auth, deletePart);

export default router;
