/**
 * Harvester routes.
 * Admin routes (auth required) and public routes.
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import {
  getAllHarvesters,
  getHarvester,
  createHarvester,
  updateHarvester,
  deleteHarvester,
} from '../controllers/harvesterController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'harvesters'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE'), false);
    }
  },
});

// PUBLIC routes (no auth required)
router.get('/', getAllHarvesters);
router.get('/:id', getHarvester);

// ADMIN routes (auth required)
router.post('/', auth, upload.single('image'), createHarvester);
router.put('/:id', auth, upload.single('image'), updateHarvester);
router.delete('/:id', auth, deleteHarvester);

export default router;