-- Create tables for flashcard app

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  question TEXT NOT NULL,
  full_answer TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  source UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant access to anon role
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (replace with more restrictive policies as needed)
CREATE POLICY "Allow all operations on chats" ON public.chats
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on collections" ON public.collections
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on flashcards" ON public.flashcards
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on chat_messages" ON public.chat_messages
  FOR ALL TO anon USING (true) WITH CHECK (true); 