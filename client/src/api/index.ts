import axios from 'axios';
import { Flashcard } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Use the server API endpoint instead of calling OpenAI directly
const SERVER_API_URL = '/api/chat';

export const generateFlashcards = async (
  question: string, 
  count: number,
  model: string = 'gpt-3.5-turbo',
  webSearchEnabled: boolean = false,
  previousMessages: Message[] = []
): Promise<{
  flashcards: Flashcard[];
  fullAnswer: string;
}> => {
  try {
    // Call our server endpoint instead of OpenAI directly
    const response = await axios.post(SERVER_API_URL, {
      question,
      count,
      model,
      webSearchEnabled,
      previousMessages
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    const { flashcards: rawFlashcards, fullAnswer } = response.data;
    
    // Ensure flashcards have proper IDs, overwriting any existing ID
    const flashcards = rawFlashcards.map((card: any) => ({
      question: card.question,
      answer: card.answer,
      id: uuidv4()
    }));
    
    return {
      flashcards,
      fullAnswer
    };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || 'Server error occurred');
    }
    throw error;
  }
};

// New utility function to convert chats to API-friendly message format
export const chatMessagesToApiMessages = (
  messages: {
    role: string;
    content: string;
    id: string;
    chatId: string;
    createdAt: string;
  }[]
): Message[] => {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system')
    .map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));
};

/**
 * Regenerate flashcards for an existing chat using its full answer
 * This could be extended to call a dedicated server endpoint for regeneration
 * For now, we'll use the same endpoint with the full answer as the question
 */
export const regenerateFlashcards = async (
  fullAnswer: string,
  count: number = 5,
  model: string = 'gpt-3.5-turbo'
): Promise<Flashcard[]> => {
  try {

    
    // For regeneration, we could either:
    // 1. Call the same endpoint with a special flag
    // 2. Create a dedicated /api/regenerate-flashcards endpoint
    // For now, we'll use approach 1 with a modified question
    const regenerationPrompt = `Please create exactly ${count} flashcards from this existing content: ${fullAnswer}`;
    
    const response = await axios.post(SERVER_API_URL, {
      question: regenerationPrompt,
      count,
      model,
      webSearchEnabled: false, // No web search needed for regeneration
      previousMessages: []
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    const { flashcards: rawFlashcards } = response.data;
    
    // Ensure flashcards have proper IDs, overwriting any existing ID
    const flashcards = rawFlashcards.map((card: any) => ({
      question: card.question,
      answer: card.answer,
      id: uuidv4()
    }));
    

    
    return flashcards;
  } catch (error) {
    console.error('Error regenerating flashcards:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.error || 'Server error occurred');
    }
    throw error;
  }
}; 