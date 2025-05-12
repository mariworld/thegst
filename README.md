# The GST: AI Flashcard Generator

A modern flashcard application that uses AI to automatically generate study materials from your questions or PDFs.

## Features

- Ask questions to generate AI-powered flashcards
- Upload PDFs to extract content and create flashcards
- Save flashcard collections for later review
- Chat history for context-aware conversations
- Database persistence with Supabase
- User authentication with email/password and Google login
- Each user has access to their own flashcards

## Setting Up Supabase Integration

This application uses Supabase for database persistence and authentication. Follow these steps to set it up:

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Set up authentication:
   - Go to Authentication > Settings
   - Set Site URL to your application URL (e.g., http://localhost:3000 for development)
   - Enable Email provider with "Confirm email" option
   - Go to Authentication > Providers
   - Enable Google provider by providing OAuth client ID and secret from Google Cloud Console

4. Set up the following tables in your Supabase database:

### Database Schema

**chats**
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  question TEXT NOT NULL,
  full_answer TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**flashcards**
```sql
CREATE TABLE flashcards (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**collections**
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  source TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**chat_messages**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Setting up Row Level Security (RLS)

To ensure each user can only access their own data, you need to set up Row Level Security:

```sql
-- Enable Row Level Security on all tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for the chats table
CREATE POLICY "Users can view their own chats" 
  ON chats FOR SELECT 
  USING (auth.uid() = user_id);

-- Similar policies for other operations and tables
-- See scripts/auth-migrations.sql for the complete set of policies
```

### Setting up the database

You can create these tables in your Supabase project using one of the following methods:

#### Method 1: Using the Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query and paste the contents of `scripts/create-tables.sql` and `scripts/auth-migrations.sql`
4. Click "Run" to execute the SQL commands

#### Method 2: Using the Supabase CLI

1. Install the Supabase CLI if you haven't already: `npm install -g supabase`
2. Log in to your Supabase account: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
4. Apply the SQL schema: `supabase db push scripts/create-tables.sql scripts/auth-migrations.sql`

5. Create a `.env` file in the project root with the following variables:
```
# OpenAI API key for AI-powered flashcards
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Port configuration
PORT=3001
```

6. Replace `your_supabase_url_here` and `your_supabase_anon_key_here` with the values from your Supabase project settings.

## Setup and Installation

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm start
```

Build for production:
```bash
npm run build
```

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

## Future Enhancements

- PDF document upload for flashcard generation
- User accounts to save flashcard sets
- Export flashcards to different formats
- Custom flashcard themes

## License

MIT