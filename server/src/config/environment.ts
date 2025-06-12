import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: process.env.PORT || 3001,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    apiUrl: 'https://api.openai.com/v1/chat/completions'
  },
  server: {
    jsonLimit: '50mb'
  }
};