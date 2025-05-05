import React, { useState } from 'react';
import { Card, Typography, Badge, Popconfirm } from 'antd';
import { SyncOutlined, DeleteOutlined } from '@ant-design/icons';
import { Flashcard as FlashcardType } from '../types';

const { Paragraph, Text } = Typography;

interface FlashcardProps {
  card: FlashcardType;
  onDelete?: (id: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ card, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking delete
    if (onDelete && card.id) {
      // Ensure card.id is a string when passing to onDelete
      onDelete(String(card.id));
    }
  };

  return (
    <Card
      hoverable
      className="flashcard"
      style={{ 
        borderColor: '#303030', 
        backgroundColor: '#1f1f1f',
        cursor: 'pointer',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        position: 'relative',
        marginTop: '20px',
        paddingTop: '8px',
        width: '100%'
      }}
      bodyStyle={{ 
        padding: '24px 20px',
        height: '300px', // Fixed height for consistency
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onClick={handleFlip}
    >
      {onDelete && (
        <Popconfirm
          title="Delete this flashcard?"
          description="This cannot be undone."
          onConfirm={(e) => { if (e) { e.stopPropagation(); } handleDelete(e as React.MouseEvent); }}
          onCancel={(e) => { if (e) { e.stopPropagation(); } }}
          okText="Yes"
          cancelText="No"
          placement="topRight"
        >
          <DeleteOutlined 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              color: '#ff4d4f',
              fontSize: '16px',
              zIndex: 2,
              cursor: 'pointer'
            }}
          />
        </Popconfirm>
      )}
      
      <div style={{
        position: 'absolute',
        top: '-14px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
      }}>
        <Badge 
          count={isFlipped ? 'ANSWER' : 'QUESTION'} 
          style={{ 
            backgroundColor: isFlipped ? '#237804' : '#096dd9', 
            padding: '0 16px',
            height: '28px',
            lineHeight: '28px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 'bold'
          }} 
        />
      </div>
      
      {/* Content container with fixed height */}
      <div style={{ 
        flex: 1,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '8px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden' // Changed from auto to hidden, each content div handles its own overflow
      }}>
        {/* Use absolute positioning to show/hide the content without changing layout */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isFlipped ? 0 : 1,
          transition: 'opacity 0.2s ease',
          pointerEvents: isFlipped ? 'none' : 'auto',
          padding: '16px',
          overflow: 'auto' // Allow scrolling in each content container
        }}>
          <Paragraph style={{ 
            color: 'white', 
            fontSize: '18px', 
            textAlign: 'center', 
            margin: 0,
            wordBreak: 'break-word',
            width: '100%'
          }}>
            {card.question || 'No question available'}
          </Paragraph>
        </div>
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-start', // Changed from center to flex-start
          justifyContent: 'center',
          opacity: isFlipped ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: isFlipped ? 'auto' : 'none',
          padding: '16px',
          overflowY: 'auto' // Enable vertical scrolling
        }}>
          <Paragraph style={{ 
            color: 'white', 
            fontSize: '18px', 
            textAlign: 'center', 
            margin: 0,
            wordBreak: 'break-word',
            width: '100%',
            paddingTop: '10px', // Add some padding at the top
            paddingBottom: '10px' // Add some padding at the bottom
          }}>
            {card.answer || 'No answer available'}
          </Paragraph>
        </div>
      </div>

      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <Text type="secondary" style={{ 
          fontSize: '13px', 
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