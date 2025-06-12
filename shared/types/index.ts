export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface ChatResponse {
  flashcards: Flashcard[];
  fullAnswer: string;
} 