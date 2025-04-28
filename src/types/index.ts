export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface OpenAIResponse {
  flashcards: Flashcard[];
  summary?: string;
}

export interface ChatResponse {
  flashcards: Flashcard[];
  fullAnswer: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
} 