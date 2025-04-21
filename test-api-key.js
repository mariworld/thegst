import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_KEY = process.env.VITE_OPENAI_API_KEY;
console.log('API Key found:', API_KEY ? 'Yes' : 'No');
console.log('API Key first 4 chars:', API_KEY?.substring(0, 4));

async function testOpenAI() {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error testing OpenAI API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testOpenAI(); 