import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIService } from '../services/openaiService.js';
import { Flashcard } from '../../../shared/types/index.js';

export class ChatController {
  private openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
  }

  async generateFlashcards(req: Request, res: Response): Promise<Response> {
    console.log('Received request:', req.body);
    
    try {
      const { question, count, model = 'gpt-3.5-turbo', webSearchEnabled = false, previousMessages = [] } = req.body;
      
      // Validate input
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      if (!count || count < 1 || count > 10) {
        return res.status(400).json({ error: 'Count must be between 1 and 10' });
      }

      console.log(`Model: ${model}, Web search enabled: ${webSearchEnabled}`);

      try {
        // Step 1: Get full answer from OpenAI
        const fullAnswer = await this.openaiService.getFullAnswer(
          question,
          model,
          webSearchEnabled,
          previousMessages
        );
        
        console.log('Full answer:', fullAnswer.substring(0, 100) + '...');

        // Step 2: Generate flashcards from the full answer
        const flashcardsData = await this.openaiService.generateFlashcards(
          fullAnswer,
          count,
          model,
          webSearchEnabled,
          question
        );

        // Add UUIDs to flashcards
        const flashcardsWithIds: Flashcard[] = flashcardsData.map((card) => ({
          ...card,
          id: uuidv4()
        }));

        console.log(`Returning ${flashcardsWithIds.length} flashcards`);
        
        // Return both the flashcards and the full answer
        return res.json({
          flashcards: flashcardsWithIds,
          fullAnswer
        });
      } catch (error) {
        console.error('OpenAI API Error:', error);
        return res.status(500).json({ error: 'Error calling OpenAI API. Check your API key and limits.' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  }
} 