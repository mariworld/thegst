import React, { useState } from 'react';
import { Card, Typography, Badge } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Flashcard as FlashcardType } from '../types';

const { Paragraph, Text } = Typography;

interface FlashcardProps {
  card: FlashcardType;
}

const Flashcard: React.FC<FlashcardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Card
      hoverable
      style={{ 
        borderColor: '#303030', 
        backgroundColor: '#1f1f1f',
        cursor: 'pointer',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        width: '100%',
        position: 'relative',
        paddingTop: '16px'
      }}
      bodyStyle={{ 
        padding: '32px 40px',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleFlip}
    >
      <div style={{
        position: 'absolute',
        top: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
        width: 'auto'
      }}>
        <Badge 
          count={isFlipped ? 'ANSWER' : 'QUESTION'} 
          style={{ 
            backgroundColor: isFlipped ? '#237804' : '#096dd9', 
            padding: '0 16px',
            height: '32px',
            lineHeight: '32px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 'bold'
          }} 
        />
      </div>
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '16px 16px',
        maxWidth: '90%',
        margin: '0 auto'
      }}>
        <Paragraph style={{ 
          color: '#d9d9d9', 
          fontSize: '20px', 
          textAlign: 'center', 
          margin: 0,
          lineHeight: 1.5,
          wordBreak: 'break-word'
        }}>
          {isFlipped 
            ? card.answer || 'No answer available' 
            : card.question || 'No question available'
          }
        </Paragraph>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Text type="secondary" style={{ 
          fontSize: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#9CA3AF'
        }}>
          <SyncOutlined style={{ marginRight: 8 }} spin={false} />
          Click to see {isFlipped ? 'question' : 'answer'}
        </Text>
      </div>
    </Card>
  );
};

export default Flashcard; 