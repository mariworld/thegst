import axios from 'axios';
import { Flashcard, ChatResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Get API key from environment
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// This function will be used to call the API endpoint we'll create
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
    console.log('API key available:', API_KEY ? 'Yes' : 'No');
    console.log('Using model:', model);
    console.log('Web search enabled:', webSearchEnabled);
    console.log('Previous messages count:', previousMessages.length);
    
    if (!API_KEY) {
      throw new Error('OpenAI API key is missing. Please check your .env file.');
    }

    // Build messages array with history if available
    const messages: Message[] = [];
    
    // Add system message
    messages.push({ 
      role: 'system', 
      content: webSearchEnabled ? 
        'You are a helpful assistant with access to web search. When appropriate, search for up-to-date information to answer the query accurately.' : 
        'You are a helpful assistant.'
    });
    
    // Add previous messages if any
    if (previousMessages.length > 0) {
      messages.push(...previousMessages);
    }
    
    // Add current user question
    messages.push({ role: 'user', content: question });

    // Step 1: Get the full answer
    console.log('Getting full answer from OpenAI...');
    const fullAnswerResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: model,
        messages: messages,
        temperature: 0.7,
        ...(webSearchEnabled && { 
          tools: [{ 
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for current information"
            }
          }], 
          tool_choice: "auto" 
        })
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    // Log the entire response structure for debugging
    console.log('Response structure:', JSON.stringify(fullAnswerResponse.data).substring(0, 500) + '...');
    
    // Handle different response formats based on whether tool calls were made
    let fullAnswer = '';
    const responseMessage = fullAnswerResponse.data.choices[0].message;
    
    if (responseMessage.content !== null && responseMessage.content !== undefined) {
      // Standard response with content
      fullAnswer = responseMessage.content;
      console.log('Direct answer received without web search');
    } else if (responseMessage.tool_calls) {
      // The model used tools (web search)
      console.log('Tool calls detected in response, processing web search request');
      
      try {
        // Extract the web search query from the tool call
        const toolCall = responseMessage.tool_calls[0];
        let webSearchQuery = question; // Default to original question
        
        if (toolCall.function && toolCall.function.arguments) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            if (args.query) {
              webSearchQuery = args.query;
              console.log('Extracted web search query:', webSearchQuery);
            }
          } catch (e) {
            console.log('Could not parse web search arguments, using original question');
          }
        }
        
        // In a real implementation, we would make an actual web search API call here
        // For now, we'll simulate web search results
        const simulatedSearchResults = `Web search results for "${webSearchQuery}": 
        1. ${webSearchQuery} is a topic that has recent developments as of ${new Date().toLocaleDateString()}.
        2. According to recent sources, ${webSearchQuery} is commonly discussed in relation to technology and education.
        3. Many experts suggest that ${webSearchQuery} will continue to evolve in coming years.`;
        
        console.log('Simulated search results:', simulatedSearchResults.substring(0, 100) + '...');
        
        // Create updated messages array with tool results
        const updatedMessages = [
          ...messages,
          { 
            role: 'assistant', 
            content: null, 
            tool_calls: responseMessage.tool_calls 
          },
          { 
            role: 'tool', 
            tool_call_id: toolCall.id, 
            content: simulatedSearchResults
          }
        ];
        
        // Make a second API call to get the final answer with the search results
        const followUpResponse = await axios.post(
          OPENAI_API_URL,
          {
            model: model,
            messages: updatedMessages,
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
        
        console.log('Follow-up response received after web search');
        fullAnswer = followUpResponse.data.choices[0].message.content;
        if (!fullAnswer) {
          throw new Error('No content in follow-up response');
        }
      } catch (searchError) {
        console.error('Error processing web search:', searchError);
        fullAnswer = `I attempted to search the web for information about "${question}" but encountered an issue with the search process. Here's what I know about the topic without web search: ${question} is a topic that might have recent developments that aren't covered in my training data.`;
      }
    } else {
      // Fallback for unexpected format
      console.log('Unexpected message format:', responseMessage);
      fullAnswer = 'The AI processed your query but returned data in an unexpected format.';
    }
    
    console.log('Full answer:', fullAnswer.substring(0, 100) + '...');

    // Step 2: Generate flashcards from the full answer
    console.log('Calling OpenAI for flashcards...');
    const flashcardsResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates flashcards from text. You MUST respond with valid JSON only, with no additional text or explanations.'
          },
          {
            role: 'user',
            content: `Create exactly ${count} flashcards from the following answer. Each flashcard should have a question and answer. The question should be a specific, targeted query that tests understanding of a key concept, and the answer should be comprehensive but concise. Format your response as a JSON array with objects containing "id", "question", and "answer" fields. Do not include any explanations, markdown formatting, or non-JSON text in your answer. Here is the text to create flashcards from:\n\n${fullAnswer}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    // Get the flashcards response
    console.log('Got response from OpenAI for flashcards');
    const flashcardsContent = flashcardsResponse.data.choices[0].message.content;
    
    // Try to parse the response
    try {
      // Clean the content to ensure it's valid JSON
      const cleanedContent = flashcardsContent.trim().replace(/```json|```/g, '');
      const parsedResponse = JSON.parse(cleanedContent);
      
      // Make sure it's an array
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure each item has the required fields
      const flashcards = parsedResponse.map((item, index) => ({
        id: uuidv4(),
        question: item.question || `Question ${index + 1}`,
        answer: item.answer || `Answer ${index + 1}`
      }));
      
      // Log the flashcards
      console.log(`Generated ${flashcards.length} flashcards`);
      
      return {
        flashcards,
        fullAnswer
      };
    } catch (error) {
      console.error('Error parsing flashcards response:', error);
      console.error('Raw response:', flashcardsContent);
      
      // Attempt to recover by creating default flashcards
      const defaultFlashcards = Array.from({ length: count }, (_, i) => ({
        id: uuidv4(),
        question: `Question ${i + 1} (Error in parsing)`,
        answer: `Sorry, there was an error generating this flashcard. Please try again with different parameters.`
      }));
      
      return {
        flashcards: defaultFlashcards,
        fullAnswer
      };
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
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
 * @param fullAnswer The full answer text from the existing chat
 * @param count The number of flashcards to generate
 * @param model The OpenAI model to use
 * @returns A promise with the generated flashcards
 */
export const regenerateFlashcards = async (
  fullAnswer: string,
  count: number = 5,
  model: string = 'gpt-3.5-turbo'
): Promise<Flashcard[]> => {
  try {
    console.log('Regenerating flashcards from existing answer...');
    const flashcardsResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates flashcards from text. You MUST respond with valid JSON only, with no additional text or explanations.'
          },
          {
            role: 'user',
            content: `Create exactly ${count} flashcards from the following answer. Each flashcard should have a question and answer. The question should be a specific, targeted query that tests understanding of a key concept, and the answer should be comprehensive but concise. Format your response as a JSON array with objects containing "id", "question", and "answer" fields. Do not include any explanations, markdown formatting, or non-JSON text in your answer. Here is the text to create flashcards from:\n\n${fullAnswer}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    // Get the flashcards response
    console.log('Got response from OpenAI for regenerated flashcards');
    const flashcardsContent = flashcardsResponse.data.choices[0].message.content;
    
    // Try to parse the response
    try {
      // Clean the content to ensure it's valid JSON
      const cleanedContent = flashcardsContent.trim().replace(/```json|```/g, '');
      const parsedResponse = JSON.parse(cleanedContent);
      
      // Make sure it's an array
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure each item has the required fields
      const flashcards = parsedResponse.map((item, index) => ({
        id: uuidv4(),
        question: item.question || `Question ${index + 1}`,
        answer: item.answer || `Answer ${index + 1}`
      }));
      
      // Log the flashcards
      console.log(`Regenerated ${flashcards.length} flashcards`);
      
      return flashcards;
    } catch (error) {
      console.error('Error parsing regenerated flashcards response:', error);
      console.error('Raw response:', flashcardsContent);
      
      // Attempt to recover by creating default flashcards
      const defaultFlashcards = Array.from({ length: count }, (_, i) => ({
        id: uuidv4(),
        question: `Question ${i + 1} (Error in parsing)`,
        answer: `Sorry, there was an error generating this flashcard. Please try again with different parameters.`
      }));
      
      return defaultFlashcards;
    }
  } catch (error) {
    console.error('Error regenerating flashcards:', error);
    throw error;
  }
}; 