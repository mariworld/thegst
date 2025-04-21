import axios from 'axios';
import { Flashcard } from '../types';

// Get API key from environment
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// This function will be used to call the API endpoint we'll create
export const generateFlashcards = async (
  question: string, 
  count: number,
  model: string = 'gpt-3.5-turbo',
  webSearchEnabled: boolean = false
): Promise<{
  flashcards: Flashcard[];
  fullAnswer: string;
}> => {
  try {
    console.log('API key available:', API_KEY ? 'Yes' : 'No');
    console.log('Using model:', model);
    console.log('Web search enabled:', webSearchEnabled);
    
    if (!API_KEY) {
      throw new Error('OpenAI API key is missing. Please check your .env file.');
    }

    // Step 1: Get the full answer
    console.log('Getting full answer from OpenAI...');
    const fullAnswerResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: model,
        messages: [
          { 
            role: 'system', 
            content: webSearchEnabled ? 
              'You are a helpful assistant with access to web search. When appropriate, search for up-to-date information to answer the query accurately.' : 
              'You are a helpful assistant.'
          },
          { role: 'user', content: question }
        ],
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
        
        // Make a second API call to get the final answer with the search results
        const followUpResponse = await axios.post(
          OPENAI_API_URL,
          {
            model: model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a helpful assistant with access to web search. Provide a comprehensive answer using the search results.' 
              },
              { role: 'user', content: question },
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
      // Fallback for unexpected response format
      console.log('Unexpected message format:', responseMessage);
      fullAnswer = 'The AI processed your query but returned data in an unexpected format.';
    }
    
    console.log('Full answer received:', fullAnswer ? fullAnswer.substring(0, 100) + '...' : 'No content');
    
    // Step 2: Generate flashcards
    console.log('Generating flashcards...');
    const flashcardsResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: model,
        messages: [
          { 
            role: 'system', 
            content: webSearchEnabled ?
              'You are a precise JSON generator with access to web search. When appropriate, search for current information. Respond with ONLY valid JSON.' :
              'You are a precise JSON generator. Respond with ONLY valid JSON.'
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
        temperature: 0.5,
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
    
    // Log the flashcards response structure
    console.log('Flashcards response structure:', JSON.stringify(flashcardsResponse.data).substring(0, 500) + '...');
    
    // Handle different response formats for the flashcards
    let content = '';
    const flashcardsResponseMessage = flashcardsResponse.data.choices[0].message;
    
    if (flashcardsResponseMessage.content !== null && flashcardsResponseMessage.content !== undefined) {
      // Standard response with JSON content
      content = flashcardsResponseMessage.content;
    } else if (flashcardsResponseMessage.tool_calls) {
      // The model used tools but didn't return a final structure
      console.log('Tool calls detected in flashcards response');
      
      try {
        // Extract the tool call
        const toolCall = flashcardsResponseMessage.tool_calls[0];
        let webSearchQuery = `flashcards about ${question}`;
        
        if (toolCall.function && toolCall.function.arguments) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            if (args.query) {
              webSearchQuery = args.query;
              console.log('Extracted flashcards web search query:', webSearchQuery);
            }
          } catch (e) {
            console.log('Could not parse flashcards web search arguments');
          }
        }
        
        // Simulate web search results for flashcards
        const simulatedFlashcardSearchResults = `Web search results for "${webSearchQuery}": 
        1. ${webSearchQuery} is a common topic for educational resources and study guides.
        2. Popular flashcard topics related to ${webSearchQuery} include key definitions, important concepts, and notable examples.
        3. Best practices for creating flashcards about ${webSearchQuery} suggest focusing on core principles and using clear, concise language.`;
        
        // Make a follow-up call to get the final flashcards with search results
        const followUpFlashcardsResponse = await axios.post(
          OPENAI_API_URL,
          {
            model: model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a precise JSON generator. Create flashcards in valid JSON format based on the information provided. Include any relevant details from web search results.' 
              },
              { 
                role: 'user', 
                content: `Create ${count} flashcards about: ${question}. Include information from the full answer.` 
              },
              { 
                role: 'assistant', 
                content: null, 
                tool_calls: flashcardsResponseMessage.tool_calls 
              },
              { 
                role: 'tool', 
                tool_call_id: toolCall.id, 
                content: simulatedFlashcardSearchResults
              },
              {
                role: 'user',
                content: `Now create exactly ${count} flashcards based on this information and the original answer: ${fullAnswer}

Format your response as a valid JSON object with this EXACT structure:
{
  "flashcards": [
    {"question": "First question?", "answer": "First answer"},
    {"question": "Second question?", "answer": "Second answer"}
  ]
}
DO NOT include any text outside the JSON object.`
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
        
        content = followUpFlashcardsResponse.data.choices[0].message.content;
        if (!content) {
          throw new Error('No content in flashcards follow-up response');
        }
      } catch (flashcardsSearchError) {
        console.error('Error processing flashcards with web search:', flashcardsSearchError);
        // Create generic flashcards as a fallback
        content = JSON.stringify({
          flashcards: Array.from({ length: count }, (_, i) => ({
            question: `Question ${i+1} about ${question}?`,
            answer: `This would contain information about ${question} relevant to question ${i+1}.`
          }))
        });
      }
    } else {
      // Fallback for unexpected format
      console.log('Unexpected flashcards message format:', flashcardsResponseMessage);
      content = JSON.stringify({
        flashcards: [
          {
            question: "What happened with my request?",
            answer: "The AI processed your query but returned data in an unexpected format."
          }
        ]
      });
    }
    
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