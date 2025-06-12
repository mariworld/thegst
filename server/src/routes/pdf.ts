import { Router } from 'express';
import { PDFController } from '../controllers/pdfController.js';

const router = Router();
const pdfController = new PDFController();

// PDF extraction endpoint
router.post('/extract-pdf', async (req, res) => {
  await pdfController.extractPDF(req, res);
});

// Test PDF extraction endpoint  
router.post('/test-extract-pdf', async (req, res) => {
  await pdfController.testExtractPDF(req, res);
});

export default router; 