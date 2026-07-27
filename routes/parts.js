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
  bulkCreateParts,
  deletePartsByImage,
  addHotspotToExistingPart,
  bulkCreatePartsNoDiagram,
  getPartsBySection,
} from '../controllers/partController.js';

const router = express.Router();

// Admin routes (auth required)
router.get('/by-section', auth, getPartsBySection);
router.get('/', auth, getPartsByImage);
router.post('/', auth, createPart);
router.post('/bulk', auth, bulkCreateParts);
router.post('/bulk-no-diagram', auth, bulkCreatePartsNoDiagram);
router.delete('/', auth, deletePartsByImage);
router.put('/hotspots/:coordinate_id', auth, updateHotspot);
router.post('/:id/hotspots', auth, addHotspotToExistingPart);
router.put('/:id', auth, updatePart);
router.delete('/:id', auth, deletePart);

export default router;








// /**
//  * Part routes.
//  * Admin routes (auth required) for parts and hotspots management.
//  */
// import express from 'express';
// import auth from '../middleware/auth.js';
// import {
//   createPart,
//   getPartsByImage,
//   updatePart,
//   updateHotspot,
//   deletePart,
// } from '../controllers/partController.js';

// const router = express.Router();

// // Admin routes (auth required)
// router.get('/', auth, getPartsByImage);
// router.post('/', auth, createPart);
// router.put('/hotspots/:coordinate_id', auth, updateHotspot);
// router.put('/:id', auth, updatePart);
// router.delete('/:id', auth, deletePart);

// export default router;