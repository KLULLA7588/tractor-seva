/**
 * Harvester routes.
 * Admin routes (auth required) and public routes.
 */
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import s3 from '../utils/utils/s3.js';
import {
  getAllHarvesters,
  getHarvester,
  createHarvester,
  updateHarvester,
  deleteHarvester,
} from '../controllers/harvesterController.js';

const router = express.Router();

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `harvesters/${uuidv4()}${ext}`);
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