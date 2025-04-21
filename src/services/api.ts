import axios from 'axios';
import { OpenAIResponse } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generateFlashcards = async (text: string): Promise<OpenAIResponse> => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates flashcards and summaries from text.'
          },
          {
            role: 'user',
            content: `Generate 3-5 flashcards from the following text. Each flashcard should have a question and answer format. Also provide a summary of the text. Format the response as a JSON object with 'flashcards' array of objects with 'question' and 'answer' fields, and a 'summary' field. The text is: ${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Parse the content from the response
    const content = response.data.choices[0].message.content;
    const parsedResponse = JSON.parse(content);
    
    // Add IDs to each flashcard
    const flashcardsWithIds = parsedResponse.flashcards.map((card: any, index: number) => ({
      ...card,
      id: `card-${index}`
    }));

    return {
      flashcards: flashcardsWithIds,
      summary: parsedResponse.summary
    };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}; 