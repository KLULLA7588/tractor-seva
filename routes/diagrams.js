/**
 * Diagram routes.
 * Admin routes (auth required) for diagram management.
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import { uploadDiagram, getDiagram, deleteDiagram } from '../controllers/diagramController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer config for diagram images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'diagrams'));
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
router.get('/', getDiagram);

// ADMIN routes (auth required)
router.post('/', auth, upload.single('image'), uploadDiagram);
router.delete('/:id', auth, deleteDiagram);

export default router;
