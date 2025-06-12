import { Router } from 'express';
import chatRoutes from './chat.js';
import pdfRoutes from './pdf.js';
import testRoutes from './test.js';

const router = Router();

// Register all route modules
router.use(chatRoutes);
router.use(pdfRoutes);
router.use(testRoutes);

export default router; 