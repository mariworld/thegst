import axios, { AxiosError } from 'axios';
import { config } from '../config/environment.js';

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: any[];
    };
  }>;
}

export class OpenAIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.openai.apiKey || '';
    this.apiUrl = config.openai.apiUrl;
    
    if (!this.apiKey) {
      throw new Error('OpenAI API Key is missing');
    }
  }

  async getFullAnswer(
    question: string,
    model: string,
    webSearchEnabled: boolean,
    previousMessages: Message[] = []
  ): Promise<string> {
    const response = await axios.post<OpenAIResponse>(
      this.apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: webSearchEnabled ? 
              'You are a helpful assistant with access to web search.' : 
              'You are a helpful assistant that provides detailed answers to questions.'
          },
          ...previousMessages,
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const responseMessage = response.data.choices[0].message;
    return responseMessage.content || 'No response received';
  }

  async generateFlashcards(
    fullAnswer: string,
    count: number,
    model: string,
    webSearchEnabled: boolean,
    question: string
  ): Promise<Array<{ question: string; answer: string }>> {
    const response = await axios.post<OpenAIResponse>(
      this.apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates flashcards from text. You MUST respond with valid JSON only.'
          },
          {
            role: 'user',
            content: `Create exactly ${count} flashcards from the following answer. 
            
You MUST respond with ONLY a valid JSON object in the following format:
{
  "flashcards": [
    {
      "question": "Question text goes here?",
      "answer": "Answer text goes here"
    }
  ]
}

The answer is: ${fullAnswer}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    if (!content) {
      throw new Error('No flashcards content received');
    }

    try {
      const parsed = JSON.parse(content);
      return parsed.flashcards || [];
    } catch (error) {
      // Fallback parsing
      return [{
        question: `What is ${question}?`,
        answer: fullAnswer.substring(0, 200)
      }];
    }
  }
} 