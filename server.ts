import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import { Flashcard } from './src/types';
import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract';

// Load environment variables
dotenv.config();

// Print API key status (not the actual key)
const API_KEY = process.env.VITE_OPENAI_API_KEY;
console.log('API Key found:', API_KEY ? 'Yes' : 'No');
console.log('API Key first 4 chars:', API_KEY?.substring(0, 4));

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = Router();
const PORT = process.env.PORT || 3001;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const pdfExtract = new PDFExtract();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase JSON limit for PDF uploads
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/api', router);

// API routes
app.post('/api/chat', async (req: Request, res: Response) => {
  console.log('Received request:', req.body);
  
  try {
    const { question, count } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!count || count < 1 || count > 10) {
      return res.status(400).json({ error: 'Count must be between 1 and 10' });
    }

    console.log(`API Key: ${API_KEY ? 'Found' : 'Missing'}`);
    if (!API_KEY) {
      return res.status(500).json({ error: 'OpenAI API Key is missing' });
    }

    // Step 1: Get full answer from OpenAI
    console.log('Calling OpenAI for full answer...');
    try {
      const fullAnswerResponse = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides detailed answers to questions.'
            },
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
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );

      console.log('Got full answer from OpenAI');
      const fullAnswer = fullAnswerResponse.data.choices[0].message.content;

      // Step 2: Generate flashcards from the full answer
      console.log('Calling OpenAI for flashcards...');
      const flashcardsResponse = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates flashcards from text. You MUST respond with valid JSON only, with no additional text, markdown, or explanations.'
            },
            {
              role: 'user',
              content: `Create exactly ${count} flashcards from the following answer. 
              
Each flashcard should have a question and answer format.

You MUST respond with ONLY a valid JSON object in the following format:
{
  "flashcards": [
    {
      "question": "Question text goes here?",
      "answer": "Answer text goes here"
    },
    ...more flashcards...
  ]
}

Do not include any explanations, markdown formatting, or additional text outside the JSON object. The answer is: ${fullAnswer}`
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

      console.log('Got flashcards from OpenAI');
      const flashcardsContent = flashcardsResponse.data.choices[0].message.content;
      console.log('Flashcards content:', flashcardsContent);
      
      let parsedFlashcards: { flashcards: Array<{ question: string, answer: string }> } | null = null;
      
      try {
        parsedFlashcards = JSON.parse(flashcardsContent);
        console.log('Successfully parsed flashcards JSON');
      } catch (error) {
        // Try to extract JSON if the content is not pure JSON
        console.error('Error parsing JSON directly:', error);
        try {
          // Sometimes OpenAI returns markdown-wrapped JSON like ```json {...} ```
          const jsonMatch = flashcardsContent.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            parsedFlashcards = JSON.parse(jsonMatch[1]);
            console.log('Successfully parsed JSON from markdown code block');
          } else {
            // Try to find any JSON-like structure
            const jsonRegex = /{[\s\S]*?}/g;
            const matches = flashcardsContent.match(jsonRegex);
            if (matches) {
              for (const match of matches) {
                try {
                  const possibleJson = JSON.parse(match);
                  if (possibleJson.flashcards && Array.isArray(possibleJson.flashcards)) {
                    parsedFlashcards = possibleJson;
                    console.log('Successfully extracted JSON from content');
                    break;
                  }
                } catch (err) {
                  // Continue trying other matches
                  console.log('Failed to parse potential JSON match:', err);
                }
              }
            }
            
            if (!parsedFlashcards) {
              // As a fallback, manually create flashcard objects
              console.log('Creating flashcards manually from content');
              const lines = flashcardsContent.split('\n');
              const extractedFlashcards: Array<{ question: string, answer: string }> = [];
              
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.match(/^(\d+\.|Flashcard \d+:|Q\d+:)/i)) {
                  const questionLine = line.replace(/^(\d+\.|Flashcard \d+:|Q\d+:)/i, '').trim();
                  let answerLine = '';
                  
                  // Look for answer in next lines
                  for (let j = i + 1; j < lines.length && j < i + 5; j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine.match(/^(A\d+:|Answer:)/i) || (nextLine.startsWith('-') && questionLine.endsWith('?'))) {
                      answerLine = nextLine.replace(/^(A\d+:|Answer:|-)/i, '').trim();
                      break;
                    }
                  }
                  
                  if (questionLine && answerLine) {
                    extractedFlashcards.push({
                      question: questionLine,
                      answer: answerLine
                    });
                  }
                }
              }
              
              if (extractedFlashcards.length > 0) {
                parsedFlashcards = { flashcards: extractedFlashcards };
              } else {
                throw new Error('Could not extract flashcards from content');
              }
            }
          }
        } catch (innerError) {
          console.error('Error parsing or extracting flashcards JSON:', innerError);
          console.error('Raw content:', flashcardsContent);
          return res.status(500).json({ error: 'Failed to parse flashcard data from OpenAI' });
        }
      }

      if (!parsedFlashcards || !parsedFlashcards.flashcards || !Array.isArray(parsedFlashcards.flashcards)) {
        console.error('Invalid flashcards format:', parsedFlashcards);
        return res.status(500).json({ error: 'Invalid flashcard data format from OpenAI' });
      }

      // Add IDs to flashcards
      const flashcardsWithIds: Flashcard[] = parsedFlashcards.flashcards.map((card, index) => ({
        ...card,
        id: `card-${index}`
      }));

      console.log(`Returning ${flashcardsWithIds.length} flashcards`);
      
      // Return both the flashcards and the full answer
      return res.json({
        flashcards: flashcardsWithIds,
        fullAnswer
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
      }
      return res.status(500).json({ error: 'Error calling OpenAI API. Check your API key and limits.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  console.log('Test endpoint hit');
  return res.status(200).json({ message: 'Server is working!' });
});

// Test PDF extraction endpoint
router.post('/test-extract-pdf', async (req: Request, res: Response) => {
  try {
    // Return sample text without needing a real PDF
    return res.status(200).json({
      success: true,
      extractedText: "This is sample text from a PDF extraction test. This text would normally be extracted from an uploaded PDF file. You can use this to test the flashcard generation without needing to successfully parse a real PDF."
    });
  } catch (error) {
    console.error('Error with test PDF extraction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to provide test PDF text',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// PDF extraction endpoint
router.post('/extract-pdf', async (req: Request, res: Response) => {
  console.log('PDF extraction endpoint hit');
  try {
    // Check if we have PDF data in the request
    if (!req.body || !req.body.pdfData) {
      console.log('No PDF data found in request');
      return res.status(400).json({
        success: false,
        message: 'No PDF data found in request'
      });
    }

    // Get the PDF data from the request
    const { pdfData } = req.body;
    console.log('Received PDF data of length:', pdfData.length);
    
    // Check if the PDF data is in base64 format
    if (!pdfData.startsWith('data:application/pdf;base64,')) {
      console.log('PDF data is not in base64 format');
      return res.status(400).json({
        success: false,
        message: 'PDF data must be in base64 format'
      });
    }
    
    // Extract the base64 data
    const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, '');
    console.log('Extracted base64 data of length:', base64Data.length);
    
    // Convert base64 to buffer
    const dataBuffer = Buffer.from(base64Data, 'base64');
    console.log('Converted to buffer of length:', dataBuffer.length);

    // Set up options for PDF extraction
    const options: PDFExtractOptions = { max: 100 };

    // Extract text from PDF using pdf.js-extract
    console.log('Extracting text from PDF buffer...');
    const data = await pdfExtract.extractBuffer(dataBuffer, options);
    console.log('PDF extraction data:', JSON.stringify(data).substring(0, 200) + '...');

    // Process the extracted text based on actual structure
    let fullText = '';
    let pageCount = 0;

    if (data && data.pages && Array.isArray(data.pages)) {
      pageCount = data.pages.length;
      console.log('PDF extraction complete, pages found:', pageCount);
      
      for (const page of data.pages) {
        if (page.content && Array.isArray(page.content)) {
          const pageContent = page.content.map(item => item.str || '').join(' ');
          fullText += pageContent + '\n\n';
        }
      }
      
      // Check if we extracted any meaningful text
      if (!fullText.trim()) {
        console.log('No text could be extracted from PDF, but structure was valid. Using fallback content.');
        fullText = `This PDF couldn't be extracted properly, likely because it contains:
- Scanned images without OCR
- Protected content
- Text embedded in a non-standard way
- Custom fonts or characters

You can still create flashcards from these sample resume topics:
1. Professional experience and responsibilities
2. Technical skills and proficiencies
3. Educational background and qualifications
4. Project highlights and achievements
5. Leadership roles and team contributions`;
      }
    } else {
      console.error('PDF extraction failed: Invalid or incomplete extraction data');
      throw new Error('Invalid or incomplete extraction data');
    }

    // Return the extracted text
    console.log('Successfully extracted text from PDF');
    console.log('Extracted text length:', fullText.length);
    console.log('Extracted text sample:', fullText.substring(0, 200) + '...');
    
    return res.status(200).json({
      success: true,
      extractedText: fullText
    });
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to extract text from PDF',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Fallback route to serve the SPA
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 