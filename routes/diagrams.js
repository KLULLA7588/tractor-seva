/**
 * Diagram routes.
 * Admin routes (auth required) for diagram management.
 */
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import s3 from '../utils/utils/s3.js';
import { uploadDiagram, getDiagram, deleteDiagram } from '../controllers/diagramController.js';

const router = express.Router();

// Multer config for diagram images (S3 storage)
const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `diagrams/${uuidv4()}${ext}`);
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