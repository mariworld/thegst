# GST Flashcard Generator

An AI-powered flashcard generation application that creates study materials from text questions or PDF uploads using OpenAI's GPT models.

## 🚀 Getting Started

### Development
```bash
# Install dependencies
npm install

# Start both client and server in development mode
npm start

# Or run individually:
npm run dev     # Client only (Vite dev server)
npm run server  # Server only (Express with tsx)
```


## Features

- Ask questions to generate AI-powered flashcards
- Upload PDFs to extract content and create flashcards
- Save flashcard collections for later review
- Chat history for context-aware conversations
- Database persistence with Supabase
- User authentication with email/password and Google login
- Each user has access to their own flashcards


## Tech Stack

- React with TypeScript
- Vite
- Tailwind CSS
- Ant Design
- Express.js backend
- OpenAI API integration
- Supabase for database persistence

## Usage

1. Enter your question in the text input area
2. Set the number of flashcards you want to generate (1-10)
3. Press Enter or click "Generate Flashcards"
4. View and interact with your flashcards
5. Click on cards to flip between question and answer
6. Use "Show Full Answer" to view the complete detailed response



MIT
