import React from 'react';
import { Button, Space, Divider } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Flashcard as FlashcardType } from '../types';
import Flashcard from './Flashcard';
import FullAnswer from './FullAnswer';

interface FlashcardListProps {
  cards: FlashcardType[];
  onReset: () => void;
  showFullAnswer: boolean;
  fullAnswer: string;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ cards, onReset, showFullAnswer, fullAnswer }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ marginBottom: 36 }}>
        <Space direction="vertical" size={40} style={{ width: '100%' }}>
          {cards.map((card) => (
            <div key={card.id} style={{ position: 'relative', paddingTop: '16px' }}>
              <Flashcard card={card} />
            </div>
          ))}
        </Space>
      </div>
      
      <Divider style={{ 
        borderColor: '#303030', 
        margin: '16px 0 32px'
      }} />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 24, 
        paddingBottom: 16,
        flexWrap: 'wrap'
      }}>
        <Button 
          onClick={onReset}
          icon={<ReloadOutlined />}
          size="large"
          style={{ 
            backgroundColor: '#111', 
            borderColor: '#303030',
            color: 'white',
            height: 48,
            minWidth: 220,
            fontSize: '1rem',
            borderRadius: '8px'
          }}
        >
          Create New Flashcards
        </Button>
        
        {showFullAnswer && (
          <FullAnswer answer={fullAnswer} />
        )}
      </div>
    </div>
  );
};

export default FlashcardList; 