import { Router } from 'express';
import multer from 'multer';
import { PDFController } from '../controllers/pdfController.js';

const router = Router();
const pdfController = new PDFController();

// Configure multer for memory storage (suitable for serverless)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// PDF extraction endpoint with file upload
router.post('/extract-pdf', upload.single('pdf'), async (req, res) => {
  await pdfController.extractPDF(req, res);
});

// Test PDF extraction endpoint  
router.post('/test-extract-pdf', async (req, res) => {
  await pdfController.testExtractPDF(req, res);
});

export default router; 