import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { Flashcard } from '../types';
import { formatDisplayDate, formatDatabaseDate } from '../utils/dateFormatters';

export interface ChatData {
  id: string;
  title: string;
  date: string;
  question: string;
  flashcards: Flashcard[];
  fullAnswer?: string;
}

export interface CollectionData {
  id: string;
  title: string;
  date: string;
  flashcards: Flashcard[];
  source: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  role: string;
  createdAt: string;
}

// Chat Operations
export const fetchChats = async (): Promise<ChatData[]> => {
  // Get the current session and user directly
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    console.error('No authenticated user found when trying to fetch chats');
    return [];
  }
  
  const { data: chats, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
  
  // For each chat, fetch its flashcards
  const chatsWithFlashcards = await Promise.all(
    chats.map(async (chat) => {
      const { data: flashcards, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('chat_id', chat.id);
        
      if (flashcardsError) {
        console.error(`Error fetching flashcards for chat ${chat.id}:`, flashcardsError);
        return {
          id: chat.id,
          title: chat.title,
          date: formatDisplayDate(chat.date),
          question: chat.question,
          flashcards: [],
          fullAnswer: chat.full_answer
        };
      }
      
      return {
        id: chat.id,
        title: chat.title,
        date: formatDisplayDate(chat.date), 
        question: chat.question,
        flashcards: flashcards || [],
        fullAnswer: chat.full_answer
      };
    })
  );
  
  return chatsWithFlashcards;
};

export const createChat = async (title: string = 'New Chat'): Promise<ChatData | null> => {
  // Get the current session and user directly, instead of from getUser()
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  // Log for debugging
  console.log('Creating chat with user ID:', userId);
  
  if (!userId) {
    console.error('No authenticated user found when trying to create chat');
    return null;
  }
  
  const id = uuidv4();
  const now = new Date();
  const formattedDate = formatDisplayDate(now);
  const timestamp = now.toISOString(); // Use ISO string for database timestamps
  
  // Console log the values for debugging
  console.log('Creating chat with data:', {
    id,
    title,
    date: formattedDate,
    userId,
    created_at: timestamp,
    updated_at: timestamp
  });
  
  const { data, error } = await supabase
    .from('chats')
    .insert({
      id,
      title,
      date: formattedDate,
      question: '',
      full_answer: null,
      user_id: userId,
      created_at: timestamp,
      updated_at: timestamp
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating chat:', error);
    return null;
  }
  
  return {
    id: data.id,
    title: data.title,
    date: data.date,
    question: data.question,
    flashcards: [],
    fullAnswer: data.full_answer
  };
};

export const updateChat = async (
  chatId: string,
  data: {
    title?: string;
    question?: string;
    fullAnswer?: string;
  }
): Promise<boolean> => {
  const updates: any = {
    updated_at: new Date().toISOString(),
  };
  
  if (data.title) updates.title = data.title;
  if (data.question) updates.question = data.question;
  if (data.fullAnswer) updates.full_answer = data.fullAnswer;
  
  const { error } = await supabase
    .from('chats')
    .update(updates)
    .eq('id', chatId);
    
  if (error) {
    console.error('Error updating chat:', error);
    return false;
  }
  
  return true;
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  console.log('Attempting to delete chat with ID:', chatId);
  
  // First delete associated flashcards
  const { error: flashcardsError } = await supabase
    .from('flashcards')
    .delete()
    .eq('chat_id', chatId);
    
  if (flashcardsError) {
    console.error('Error deleting flashcards:', flashcardsError);
    return false;
  }
  
  console.log('Successfully deleted flashcards for chat:', chatId);
  
  // Then delete the chat
  const { data, error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .select();
    
  if (error) {
    console.error('Error deleting chat:', error);
    return false;
  }
  
  console.log('Successfully deleted chat from database:', chatId, data);
  
  return true;
};

// Flashcard Operations
export const saveFlashcards = async (
  chatId: string,
  flashcards: Flashcard[]
): Promise<boolean> => {
  // First, delete any existing flashcards for this chat to avoid duplicates
  const { error: deleteError } = await supabase
    .from('flashcards')
    .delete()
    .eq('chat_id', chatId);
    
  if (deleteError) {
    console.error('Error deleting existing flashcards:', deleteError);
    return false;
  }
  
  // Then insert the new flashcards
  const now = new Date().toISOString();
  const flashcardsToInsert = flashcards.map(card => ({
    id: card.id || uuidv4(),
    question: card.question,
    answer: card.answer,
    chat_id: chatId,
    collection_id: null,
    created_at: now,
    updated_at: now
  }));
  
  const { error } = await supabase
    .from('flashcards')
    .insert(flashcardsToInsert);
    
  if (error) {
    console.error('Error saving flashcards:', error);
    return false;
  }
  
  return true;
};

// Collection Operations
export const fetchCollections = async (): Promise<CollectionData[]> => {
  // Get the current session and user directly
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    console.error('No authenticated user found when trying to fetch collections');
    return [];
  }
  
  const { data: collections, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
  
  // For each collection, fetch its flashcards
  const collectionsWithFlashcards = await Promise.all(
    collections.map(async (collection) => {
      const { data: flashcards, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('collection_id', collection.id);
        
      if (flashcardsError) {
        console.error(`Error fetching flashcards for collection ${collection.id}:`, flashcardsError);
        return {
          id: collection.id,
          title: collection.title,
          date: formatDisplayDate(collection.date),
          flashcards: [],
          source: collection.source || ''
        };
      }
      
      return {
        id: collection.id,
        title: collection.title,
        date: formatDisplayDate(collection.date),
        flashcards: flashcards || [],
        source: collection.source || ''
      };
    })
  );
  
  return collectionsWithFlashcards;
};

export const createCollection = async (
  title: string,
  flashcards: Flashcard[],
  source: string | null = null
): Promise<CollectionData | null> => {
  // Get the current session and user directly
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    console.error('No authenticated user found when trying to create collection');
    return null;
  }
  
  const id = uuidv4();
  const now = new Date();
  const formattedDate = formatDisplayDate(now);
  const timestamp = formatDatabaseDate(now);
  
  // First, create the collection
  const { error: collectionError } = await supabase
    .from('collections')
    .insert({
      id,
      title,
      date: formattedDate,
      source: source,
      user_id: userId,
      created_at: timestamp,
      updated_at: timestamp
    })
    .select()
    .single();
    
  if (collectionError) {
    console.error('Error creating collection:', collectionError);
    return null;
  }
  
  // Then copy the flashcards and associate them with the collection
  const flashcardsWithCollectionId = flashcards.map(card => ({
    id: uuidv4(),
    question: card.question,
    answer: card.answer,
    chat_id: null,
    collection_id: id,
    created_at: timestamp,
    updated_at: timestamp
  }));
  
  const { error: flashcardsError } = await supabase
    .from('flashcards')
    .insert(flashcardsWithCollectionId);
    
  if (flashcardsError) {
    console.error('Error saving flashcards for collection:', flashcardsError);
    return null;
  }
  
  return {
    id,
    title,
    date: formattedDate,
    flashcards,
    source: source || ''
  };
};

// Chat Messages Operations (for chat history)
export const saveChatMessage = async (
  chatId: string,
  content: string,
  role: 'user' | 'assistant' | 'system'
): Promise<ChatMessage | null> => {
  // Verify user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    console.error('No authenticated user found when trying to save chat message');
    return null;
  }
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      id,
      chat_id: chatId,
      content,
      role,
      created_at: now
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error saving chat message:', error);
    return null;
  }
  
  return {
    id: data.id,
    chatId: data.chat_id,
    content: data.content,
    role: data.role,
    createdAt: data.created_at
  };
};

export const getChatHistory = async (chatId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
  
  return data.map(message => ({
    id: message.id,
    chatId: message.chat_id,
    content: message.content,
    role: message.role,
    createdAt: message.created_at
  }));
};

// Delete a specific flashcard
export const deleteFlashcard = async (flashcardId: string | number | undefined): Promise<boolean> => {
  // Handle undefined or null values
  if (!flashcardId) {
    console.error('Invalid flashcard ID: undefined or null');
    return false;
  }
  
  // Ensure flashcardId is a string
  const id = String(flashcardId);
  
  // Check if the ID is likely a non-UUID format (like "card-5")
  if (id.startsWith('card-')) {
    console.log('Converting non-UUID flashcard ID format to handle deletion');
    
    // Extract the numeric part or identifier after the "card-" prefix
    const idPart = id.substring(5); // "card-".length = 5
    
    try {
      // First, try to get the flashcard to verify it exists
      const { data, error } = await supabase
        .from('flashcards')
        .select('id')
        .like('id', `%${idPart}%`)
        .limit(1);
        
      if (error) {
        console.error('Error finding flashcard:', error);
        return false;
      }
      
      if (!data || data.length === 0) {
        console.error('Flashcard not found with ID:', id);
        return true; // Return true since the flashcard doesn't exist in the database
      }
      
      // Use the actual UUID from the database to delete
      const actualId = data[0].id;
      const { error: deleteError } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', actualId);
        
      if (deleteError) {
        console.error('Error deleting flashcard with actual ID:', deleteError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error handling non-UUID flashcard deletion:', error);
      return false;
    }
  }
  
  // Standard UUID deletion
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting flashcard:', error);
    return false;
  }
  
  return true;
};

export const deleteCollection = async (collectionId: string): Promise<boolean> => {
  console.log('Attempting to delete collection with ID:', collectionId);
  
  // First delete associated flashcards
  const { error: flashcardsError } = await supabase
    .from('flashcards')
    .delete()
    .eq('collection_id', collectionId);
    
  if (flashcardsError) {
    console.error('Error deleting flashcards for collection:', flashcardsError);
    return false;
  }
  
  console.log('Successfully deleted flashcards for collection:', collectionId);
  
  // Then delete the collection
  const { data, error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)
    .select();
    
  if (error) {
    console.error('Error deleting collection:', error);
    return false;
  }
  
  console.log('Successfully deleted collection from database:', collectionId, data);
  
  return true;
}; 