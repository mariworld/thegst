import axios from 'axios';
import { Flashcard } from '../types';

// Get API key from environment
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// This function will be used to call the API endpoint we'll create
export const generateFlashcards = async (question: string, count: number): Promise<{
  flashcards: Flashcard[];
  fullAnswer: string;
}> => {
  try {
    console.log('API key available:', API_KEY ? 'Yes' : 'No');
    
    if (!API_KEY) {
      throw new Error('OpenAI API key is missing. Please check your .env file.');
    }

    // Step 1: Get the full answer
    console.log('Getting full answer from OpenAI...');
    const fullAnswerResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: question }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const fullAnswer = fullAnswerResponse.data.choices[0].message.content;
    console.log('Full answer received:', fullAnswer.substring(0, 100) + '...');
    
    // Step 2: Generate flashcards
    console.log('Generating flashcards...');
    const flashcardsResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a precise JSON generator. Respond with ONLY valid JSON.'
          },
          { 
            role: 'user', 
            content: `
Create ${count} flashcards from this information. 
Format your response as a valid JSON object with this EXACT structure:
{
  "flashcards": [
    {"question": "First question?", "answer": "First answer"},
    {"question": "Second question?", "answer": "Second answer"}
  ]
}
DO NOT include any text outside the JSON object.

Here's the information: ${fullAnswer}
`
          }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const content = flashcardsResponse.data.choices[0].message.content;
    console.log('Raw flashcard content:', content.substring(0, 150) + '...');
    
    // Extract JSON 
    const jsonOnly = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const flashcardsJson = JSON.parse(jsonOnly);
    
    // Add IDs to flashcards
    const flashcardsWithIds = flashcardsJson.flashcards.map((card: any, index: number) => ({
      ...card,
      id: `card-${index}`
    }));
    
    return {
      flashcards: flashcardsWithIds,
      fullAnswer
    };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('OpenAI API error:', error.response.data);
    }
    throw error;
  }
}; 