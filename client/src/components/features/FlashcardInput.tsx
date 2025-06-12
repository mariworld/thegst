import React, { useState } from 'react';

interface FlashcardInputProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

const FlashcardInput: React.FC<FlashcardInputProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate(text);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Generate Flashcards</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Paste or type your text below:
          </label>
          <textarea
            id="text-input"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            isLoading || !text.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Flashcards'}
        </button>
      </form>
    </div>
  );
};

export default FlashcardInput; 