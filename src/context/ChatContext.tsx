import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Flashcard } from '../types';
import * as db from '../services/database';
import { regenerateFlashcards as apiRegenerateFlashcards } from '../api';
import { formatDisplayDate } from '../utils/dateFormatters';

export interface Chat {
  id: string;
  title: string;
  date: string;
}

export interface FlashcardCollection {
  id: string;
  title: string;
  count: number;
  date: string;
}

interface ChatData {
  id: string;
  title: string;
  date: string;
  flashcards: Flashcard[];
  question: string;
  fullAnswer?: string;
}

interface CollectionData {
  id: string;
  title: string;
  date: string;
  flashcards: Flashcard[];
  source: string; // chat ID that the collection was created from
}

interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  role: string;
  createdAt: string;
}

interface ChatContextType {
  chats: ChatData[];
  collections: CollectionData[];
  selectedChatId: string | null;
  selectedCollectionId: string | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  dbConnected: boolean;
  createNewChat: () => Promise<string>;
  selectChat: (chatId: string) => Promise<void>;
  updateChat: (chatId: string, data: Partial<Omit<ChatData, 'id'>>) => Promise<void>;
  getCurrentChat: () => ChatData | null;
  saveCollection: (chatId: string) => Promise<void>;
  selectCollection: (collectionId: string) => Promise<void>;
  getCollection: (collectionId: string) => CollectionData | null;
  addMessageToHistory: (content: string, role: 'user' | 'assistant' | 'system') => Promise<void>;
  regenerateFlashcards: (chatId: string, count?: number) => Promise<boolean>;
  deleteChat: (chatId: string) => Promise<boolean>;
  deleteFlashcard: (flashcardId: string, chatId: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Check if database tables exist
        try {
          // Try to fetch chats
          const chatsData = await db.fetchChats();
          setChats(chatsData);
          
          // Try to fetch collections
          const collectionsData = await db.fetchCollections();
          setCollections(collectionsData);
          
          // If we got here without errors, the database is connected
          setDbConnected(true);
          
          // Set selected chat if we have chats
          if (chatsData.length > 0) {
            setSelectedChatId(chatsData[0].id);
            
            // Load chat history for the selected chat
            const historyData = await db.getChatHistory(chatsData[0].id);
            setChatHistory(historyData);
          }
        } catch (dbError: any) {
          // Check if the error is about missing tables
          if (dbError?.message?.includes("relation") && dbError?.message?.includes("does not exist")) {
            console.warn("Database tables don't exist yet. Please create them according to the README instructions.");
            setDbConnected(false);
          } else {
            console.error("Database error:", dbError);
          }
          
          // Use local state as fallback
          setChats([]);
          setCollections([]);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const createNewChat = async (): Promise<string> => {
    // If DB is not connected, use local state only
    if (!dbConnected) {
      const id = uuidv4();
      const now = new Date();
      const formattedDate = formatDisplayDate(now);
      
      const newChat: ChatData = {
        id,
        title: 'New Chat',
        date: formattedDate,
        flashcards: [],
        question: '',
      };
      
      setChats(prevChats => [newChat, ...prevChats]);
      setSelectedChatId(id);
      setSelectedCollectionId(null);
      setChatHistory([]);
      
      return id;
    }
    
    try {
      const chatData = await db.createChat();
      if (!chatData) {
        console.error('Failed to create new chat');
        return '';
      }
      
      setChats(prevChats => [chatData, ...prevChats]);
      setSelectedChatId(chatData.id);
      setSelectedCollectionId(null);
      setChatHistory([]);
      
      return chatData.id;
    } catch (error) {
      console.error('Failed to create new chat', error);
      return '';
    }
  };

  const selectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    setSelectedCollectionId(null);
    
    if (dbConnected) {
      // Load chat history for the selected chat
      try {
        const historyData = await db.getChatHistory(chatId);
        setChatHistory(historyData);
      } catch (error) {
        console.error('Error loading chat history:', error);
        setChatHistory([]);
      }
    } else {
      setChatHistory([]);
    }
  };

  const updateChat = async (chatId: string, data: Partial<Omit<ChatData, 'id'>>) => {
    // First update local state
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, ...data } : chat
      )
    );
    
    // Then save to the database if connected
    if (dbConnected) {
      try {
        const dbData: any = {};
        if (data.title) dbData.title = data.title;
        if (data.question) dbData.question = data.question;
        if (data.fullAnswer) dbData.fullAnswer = data.fullAnswer;
        
        await db.updateChat(chatId, dbData);
        
        // If we have flashcards, save them too
        if (data.flashcards) {
          await db.saveFlashcards(chatId, data.flashcards);
        }
      } catch (error) {
        console.error('Error updating chat in database:', error);
      }
    }
  };

  const getCurrentChat = (): ChatData | null => {
    if (!selectedChatId) return null;
    return chats.find((chat) => chat.id === selectedChatId) || null;
  };

  const saveCollection = async (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat || chat.flashcards.length === 0) return;

    const title = chat.title || 'Untitled Collection';
    
    if (dbConnected) {
      try {
        const collectionData = await db.createCollection(title, chat.flashcards, chat.id);
        
        if (!collectionData) {
          console.error('Failed to create collection');
          return;
        }
        
        setCollections(prevCollections => [collectionData, ...prevCollections]);
      } catch (error) {
        console.error('Error saving collection to database:', error);
        
        // Fallback to local state
        const collectionId = uuidv4();
        const now = new Date();
        const formattedDate = formatDisplayDate(now);
        
        const newCollection: CollectionData = {
          id: collectionId,
          title,
          date: formattedDate,
          flashcards: [...chat.flashcards],
          source: chat.id,
        };
        
        setCollections(prevCollections => [newCollection, ...prevCollections]);
      }
    } else {
      // Local state only
      const collectionId = uuidv4();
      const now = new Date();
      const formattedDate = formatDisplayDate(now);
      
      const newCollection: CollectionData = {
        id: collectionId,
        title,
        date: formattedDate,
        flashcards: [...chat.flashcards],
        source: chat.id,
      };
      
      setCollections(prevCollections => [newCollection, ...prevCollections]);
    }
  };

  const selectCollection = async (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setSelectedChatId(null);
    setChatHistory([]);
  };

  const getCollection = (collectionId: string): CollectionData | null => {
    if (!collectionId) return null;
    return collections.find((collection) => collection.id === collectionId) || null;
  };
  
  const addMessageToHistory = async (content: string, role: 'user' | 'assistant' | 'system') => {
    if (!selectedChatId) return;
    
    const messageId = uuidv4();
    const now = new Date().toISOString();
    
    // Create message for local state
    const newMessage = {
      id: messageId,
      chatId: selectedChatId,
      content,
      role,
      createdAt: now
    };
    
    // Update local state
    setChatHistory(prevHistory => [...prevHistory, newMessage]);
    
    // Save to database if connected
    if (dbConnected) {
      try {
        const message = await db.saveChatMessage(selectedChatId, content, role);
        if (!message) {
          console.error('Failed to save chat message to database');
        }
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    }
  };

  const regenerateFlashcards = async (chatId: string, count: number = 5): Promise<boolean> => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat || !chat.fullAnswer) {
      console.error('Cannot regenerate flashcards: chat not found or missing full answer');
      return false;
    }

    try {
      // Set loading state if needed
      setIsLoading(true);
      
      // Call the API to regenerate flashcards
      const newFlashcards = await apiRegenerateFlashcards(chat.fullAnswer, count);
      
      // Update the chat with new flashcards
      await updateChat(chatId, { flashcards: newFlashcards });
      
      // Update local state immediately for a better user experience
      setChats(prevChats =>
        prevChats.map(c =>
          c.id === chatId ? { ...c, flashcards: newFlashcards } : c
        )
      );
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error regenerating flashcards:', error);
      setIsLoading(false);
      return false;
    }
  };

  const deleteFlashcard = async (flashcardId: string, chatId: string): Promise<boolean> => {
    if (!flashcardId || !chatId) {
      console.error('Cannot delete flashcard: Missing flashcardId or chatId');
      return false;
    }

    try {
      let success = true;
      
      // Update the database if connected
      if (dbConnected) {
        success = await db.deleteFlashcard(flashcardId);
      }
      
      if (success) {
        // Update the local state
        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                flashcards: chat.flashcards.filter(card => card.id !== flashcardId)
              };
            }
            return chat;
          })
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      return false;
    }
  };

  const deleteChat = async (chatId: string): Promise<boolean> => {
    if (!chatId) {
      console.error('Cannot delete chat: Missing chatId');
      return false;
    }

    try {
      let success = true;
      
      // Update the database if connected
      if (dbConnected) {
        success = await db.deleteChat(chatId);
      }
      
      if (success) {
        // Update the local state
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        // If the deleted chat was selected, select another chat or clear the selection
        if (selectedChatId === chatId) {
          const remainingChats = chats.filter(chat => chat.id !== chatId);
          if (remainingChats.length > 0) {
            await selectChat(remainingChats[0].id);
          } else {
            setSelectedChatId(null);
            setChatHistory([]);
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  };

  const value = {
    chats,
    collections,
    selectedChatId,
    selectedCollectionId,
    chatHistory,
    isLoading,
    dbConnected,
    createNewChat,
    selectChat,
    updateChat,
    getCurrentChat,
    saveCollection,
    selectCollection,
    getCollection,
    addMessageToHistory,
    regenerateFlashcards,
    deleteChat,
    deleteFlashcard
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext; 