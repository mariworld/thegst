# AI Flashcard Generator

A web application that uses AI to generate flashcards based on user questions. Built with React, TypeScript, and Ant Design.

## Features

- Ask questions and get AI-generated flashcards
- Interactive flashcard interface with question and answer sides
- Adjustable number of flashcards (1-10)
- View full detailed answer
- Dark mode UI
- Responsive design for various screen sizes

## Tech Stack

- **Frontend**: React, TypeScript, Ant Design
- **UI**: Responsive design with custom styling
- **State Management**: React useState hooks
- **Backend Integration**: API to communicate with AI services

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-flashcard-generator.git
cd ai-flashcard-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API key:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Enter your question in the text input area
2. Set the number of flashcards you want to generate (1-10)
3. Press Enter or click "Generate Flashcards"
4. View and interact with your flashcards
5. Click on cards to flip between question and answer
6. Use "Show Full Answer" to view the complete detailed response

## Future Enhancements

- PDF document upload for flashcard generation
- User accounts to save flashcard sets
- Export flashcards to different formats
- Custom flashcard themes

## License

MIT
