# AI Flashcard Generator

A React application that generates flashcards from questions using OpenAI's API.

## Features

- Ask any question
- Select number of flashcards (1-10)
- Sends the question to OpenAI and gets a detailed answer
- Converts the answer into the specified number of flashcards
- Flip flashcards to see questions and answers
- Show/hide the full answer with a button
- Clean, responsive UI with Tailwind CSS

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenAI API key

## Setup

1. Clone this repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file in the root directory with your OpenAI API key:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Running the Application

Start the development server:
```
npm run dev
```

This will start both the React frontend and the Express backend server. The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production

Build the application for production:
```
npm run build
```

Then start the production server:
```
npm start
```

## Technology Stack

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Express server for API
- OpenAI API for generating answers and flashcards

## License

MIT
