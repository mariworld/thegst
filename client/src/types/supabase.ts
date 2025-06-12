export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          title: string
          date: string
          question: string
          full_answer: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          date: string
          question: string
          full_answer?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          question?: string
          full_answer?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          question: string
          answer: string
          chat_id: string | null
          collection_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          question: string
          answer: string
          chat_id?: string | null
          collection_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          chat_id?: string | null
          collection_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          title: string
          date: string
          source: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          date: string
          source?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          source?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          content: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          chat_id: string
          content: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          content?: string
          role?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 