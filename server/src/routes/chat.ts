import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';

const router = Router();
const chatController = new ChatController();

// Chat flashcard generation endpoint
router.post('/chat', async (req, res) => {
  await chatController.generateFlashcards(req, res);
});

export default router; 