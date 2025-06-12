import { Router, Request, Response } from 'express';

const router = Router();

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  console.log('Test endpoint hit');
  return res.status(200).json({ message: 'Server is working!' });
});

export default router; 