/**
 * Tractor Seva - Main Express Server
 * Heavy Equipment Parts Catalog & Admin System
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import harvesterRoutes from './routes/harvesters.js';
import sectionRoutes from './routes/sections.js';
import diagramRoutes from './routes/diagrams.js';
import partRoutes from './routes/parts.js';
import inquiryRoutes from './routes/inquiries.js';
import publicRoutes from './routes/public.js';
import { getStats } from './controllers/statsController.js';
import auth from './middleware/auth.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Ensure upload directories exist
const uploadDirs = ['uploads/diagrams', 'uploads/harvesters'];
for (const dir of uploadDirs) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

// Middleware
app.use(cors({
  origin: frontendUrl.split(',').map((s) => s.trim()),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Tractor Seva API is running' });
});

// PUBLIC routes (no auth required)
app.use('/api', publicRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/harvesters', harvesterRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// ADMIN routes (auth required)
app.use('/api/admin/harvesters', harvesterRoutes);
app.use('/api/admin/sections', sectionRoutes);
app.use('/api/admin/diagrams', diagramRoutes);
app.use('/api/admin/parts', partRoutes);
app.use('/api/admin/inquiries', inquiryRoutes);
app.get('/api/admin/stats', auth, getStats);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Tractor Seva API server running on port ${PORT}`);
  console.log(`CORS enabled for: ${frontendUrl}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;