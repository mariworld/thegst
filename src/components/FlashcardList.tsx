import React, { useState, useEffect } from 'react';
import { Button, Card, Tabs, Row, Col, message, Skeleton } from 'antd';
import { ReloadOutlined, RedoOutlined } from '@ant-design/icons';
import { Flashcard as FlashcardType } from '../types';
import Flashcard from './Flashcard';
import { useChat } from '../context/ChatContext';



interface FlashcardListProps {
  cards: FlashcardType[];
  onReset: () => void;
  showFullAnswer: boolean;
  fullAnswer: string;
  onRegenerateComplete?: () => void;
  onCardDelete?: (deletedCardId: string) => void;
  isLoading?: boolean;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ 
  cards, 
  onReset, 
  showFullAnswer, 
  fullAnswer,
  onRegenerateComplete,
  onCardDelete,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('flashcards');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 576 : false);
  const { createNewChat, selectedChatId, regenerateFlashcards, deleteFlashcard } = useChat();

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleNewChat = () => {
    createNewChat();
    onReset();
  };

  const handleRegenerateClick = async () => {
    if (!selectedChatId) return;
    
    setIsRegenerating(true);
    
    try {
      // Use the current number of flashcards to regenerate the same amount
      const countToRegenerate = cards.length > 0 ? cards.length : 5;
      const success = await regenerateFlashcards(selectedChatId, countToRegenerate);
      
      if (success && onRegenerateComplete) {
        onRegenerateComplete();
      }
    } catch (error) {
      console.error('Error regenerating flashcards:', error);
      message.error('Failed to regenerate flashcards');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteFlashcard = async (cardId: string | number) => {
    if (!selectedChatId) return;
    
    try {
      const flashcardId = String(cardId);
      const success = await deleteFlashcard(flashcardId, selectedChatId);
      
      if (success) {
        message.success('Flashcard deleted successfully');
        if (onCardDelete) {
          onCardDelete(flashcardId);
        }
      } else {
        message.error('Failed to delete flashcard');
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      message.error('An error occurred while deleting the flashcard');
    }
  };

  // Generate skeleton placeholders for loading state
  const renderSkeletonCards = () => {
    // Create an array of 4 skeleton cards (or match the number of existing cards if any)
    const skeletonCount = cards.length > 0 ? cards.length : 4;
    return Array(skeletonCount).fill(0).map((_, index) => (
      <Col xs={24} sm={24} md={12} key={`skeleton-${index}`} className="flashcard-col">
        <div className="flashcard-card">
          <Card
            style={{ 
              borderColor: '#303030', 
              backgroundColor: '#1f1f1f',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              height: '100%',
              position: 'relative',
              marginTop: '20px',
              paddingTop: '8px'
            }}
            bodyStyle={{ 
              padding: isMobile ? '16px 12px' : '24px 20px',
              height: '100%',
              minHeight: isMobile ? '160px' : '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              width: '120px'
            }}>
              <Skeleton.Button active size="small" style={{ height: '28px', width: '100%' }} />
            </div>
            
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '8px',
              width: '100%',
            }}>
              <Skeleton active paragraph={{ rows: 3 }} title={false} />
            </div>
          </Card>
        </div>
      </Col>
    ));
  };

  const showLoadingState = isLoading || isRegenerating;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="custom-tabs"
        style={{ marginBottom: '16px' }}
        items={[
          {
            key: 'flashcards',
            label: 'Flashcards',
            children: null
          },
          {
            key: 'fullAnswer',
            label: 'Full Answer',
            children: null,
            disabled: !showFullAnswer
          }
        ]}
      />

      {activeTab === 'flashcards' && (
        <div className="flashcards-container">
          <Row gutter={[16, 24]} className="flashcards-row">
            {showLoadingState ? (
              renderSkeletonCards()
            ) : (
              cards.map((card) => (
                <Col xs={24} sm={24} md={12} key={card.id} className="flashcard-col">
                  <div className="flashcard-card">
                    <Flashcard 
                      card={card} 
                      onDelete={handleDeleteFlashcard}
                    />
                  </div>
                </Col>
              ))
            )}
          </Row>

          <div style={{ 
            marginTop: '32px', 
            textAlign: 'center', 
            paddingBottom: '24px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'center',
            gap: isMobile ? '12px' : '8px'
          }}>
            <Button 
              type="default" 
              icon={<ReloadOutlined />} 
              onClick={handleNewChat}
              style={{ 
                background: '#2a2a2a', 
                borderColor: '#303030', 
                color: 'white',
                height: isMobile ? '40px' : '44px',
                fontSize: isMobile ? '14px' : '16px',
                padding: isMobile ? '0 16px' : '0 24px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              New Chat
            </Button>
            
            {showFullAnswer && (
              <Button 
                type="default" 
                icon={<RedoOutlined spin={isRegenerating} />} 
                onClick={handleRegenerateClick}
                loading={isRegenerating}
                style={{ 
                  background: '#2a2a2a', 
                  borderColor: '#303030', 
                  color: 'white',
                  height: isMobile ? '40px' : '44px',
                  fontSize: isMobile ? '14px' : '16px',
                  padding: isMobile ? '0 16px' : '0 24px',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                Regenerate
              </Button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fullAnswer' && (
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: isMobile ? '16px 12px' : '24px',
          background: '#1a1a1a',
          borderRadius: '8px',
          color: '#e1e1e1',
          fontSize: isMobile ? '14px' : '16px',
          whiteSpace: 'pre-wrap'
        }}>
          {fullAnswer}
        </div>
      )}
    </div>
  );
};

export default FlashcardList; 