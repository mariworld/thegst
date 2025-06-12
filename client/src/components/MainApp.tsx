import { useState, useEffect } from 'react'
import { Flashcard as FlashcardType, ChatResponse } from '../types'
import { 
  ChatInput, 
  FlashcardList, 
  LoadingSpinner, 
  ErrorMessage, 
  PDFUploader, 
  ModelSelector, 
  Sidebar, 
  UserProfile 
} from '.'
import { generateFlashcards, chatMessagesToApiMessages } from '../api'
import { Layout, Typography, Row, Col, Tabs, Button, Alert, message } from 'antd'
import { useChat } from '../context/ChatContext'

const { Header, Content, Footer } = Layout
const { Title, Paragraph } = Typography

function MainApp() {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([])
  const [fullAnswer, setFullAnswer] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<string>('gpt-3.5-turbo')
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { 
    chats, 
    collections,
    selectedChatId, 
    selectedCollectionId,
    chatHistory,
    createNewChat, 
    selectChat, 
    updateChat,
    getCurrentChat,
    saveCollection,
    selectCollection,
    getCollection,
    addMessageToHistory,
    isLoading: contextLoading,
    dbConnected,
    deleteChat,
    deleteCollection
  } = useChat()

  // Initialize with a new chat if none exists
  useEffect(() => {
    if (chats.length === 0 && !contextLoading) {
      createNewChat()
    }
  }, [chats.length, createNewChat, contextLoading])

  // Load current chat or collection data when selection changes or when chat data updates
  useEffect(() => {
    if (selectedChatId) {
      const currentChat = getCurrentChat()
      if (currentChat) {
        setFlashcards(currentChat.flashcards || [])
        setFullAnswer(currentChat.fullAnswer)
      }
    } else if (selectedCollectionId) {
      const currentCollection = getCollection(selectedCollectionId)
      if (currentCollection) {
        setFlashcards(currentCollection.flashcards || [])
        setFullAnswer(undefined)  // Collections don't have full answers
      }
    } else {
      setFlashcards([])
      setFullAnswer(undefined)
    }
  }, [selectedChatId, selectedCollectionId, getCurrentChat, getCollection, chats])

  const handleSubmit = async (question: string, count: number) => {
    if (!selectedChatId) {
      // Create a new chat if none is selected
      const newChatId = await createNewChat()
      if (!newChatId) {
        setError('Failed to create a new chat. Please try again.')
        return
      }
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Log the user's question in the chat history
      await addMessageToHistory(question, 'user')
      
      // Convert chat history to the format expected by the API
      const previousMessages = chatMessagesToApiMessages(chatHistory)
      
      const result: ChatResponse = await generateFlashcards(
        question, 
        count, 
        model, 
        webSearchEnabled,
        previousMessages
      )
      
      setFlashcards(result.flashcards)
      setFullAnswer(result.fullAnswer)
      
      // Log the assistant's response in the chat history
      await addMessageToHistory(result.fullAnswer, 'assistant')
      
      // Update the current chat with new data
      if (selectedChatId) {
        await updateChat(selectedChatId, {
          title: question.length > 30 ? question.substring(0, 30) + '...' : question,
          flashcards: result.flashcards,
          question: question,
          fullAnswer: result.fullAnswer,
        })
      }
    } catch (err) {
      console.error('Error generating flashcards:', err)
      setError('Failed to generate flashcards. Please check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePDFContent = async (content: string) => {
    if (!content.trim()) {
      setError('The extracted PDF content was empty. Please try a different PDF.')
      return
    }
    
    // Create a more specific prompt for PDF content to avoid "Front:" and "Back:" formatting
    const question = `Create ${5} flashcards from this PDF content. Each flashcard should have a clear question and answer without using prefixes like "Front:" or "Back:". For each flashcard, extract a key concept from the PDF and present it as a question, with the relevant information as the answer.

PDF content: ${content.substring(0, 1000)}...`
    
    // Generate 5 flashcards by default from PDF
    handleSubmit(question, 5)
  }

  const handleReset = () => {
    setFlashcards([])
    setFullAnswer(undefined)
    setError(null)
  }

  const handleNewChat = async () => {
    await createNewChat()
  }

  const handleChatSelect = async (chatId: string) => {
    await selectChat(chatId)
  }

  const handleCollectionSelect = async (collectionId: string) => {
    await selectCollection(collectionId)
  }

  const handleSaveCollection = async (chatId: string) => {
    try {
      await saveCollection(chatId);
      message.success('Collection saved successfully');
    } catch (error) {
      console.error('Error saving collection:', error);
      message.error('Failed to save collection');
    }
  }

  // Handle flashcard deletion
  const handleFlashcardDelete = (cardId: string) => {
    // Update local state to remove the deleted flashcard
    setFlashcards(prevCards => prevCards.filter(card => card.id !== cardId));
  };

  // Handle chat deletion
  const handleChatDelete = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      // No need to update UI state as the ChatContext handles this
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat. Please try again.');
    }
  };

  // Add the handleCollectionDelete function
  const handleCollectionDelete = async (collectionId: string) => {
    try {
      await deleteCollection(collectionId);
      // No need to update UI state as the ChatContext handles this
    } catch (error) {
      console.error('Error deleting collection:', error);
      setError('Failed to delete collection. Please try again.');
    }
  };

  // Create a model selector component
  const modelSelectorComponent = (
    <div className="model-selector-container">
      <ModelSelector 
        value={model} 
        onChange={setModel} 
        disabled={isLoading} 
        webSearchEnabled={webSearchEnabled}
        onWebSearchChange={setWebSearchEnabled}
      />
    </div>
  );

  // Define tab items for Ant Design Tabs
  const tabItems = [
    {
      key: 'chat',
      label: 'Ask a Question',
      children: (
        <>
          {modelSelectorComponent}
          <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        </>
      )
    },
    {
      key: 'pdf',
      label: 'Upload PDF',
      children: (
        <>
          {modelSelectorComponent}
          <PDFUploader onPDFContent={handlePDFContent} />
        </>
      )
    }
  ];

  // Format chat and collection data for sidebar
  const sidebarChats = chats.map(chat => ({
    id: chat.id,
    title: chat.title || 'New Chat',
    date: chat.date
  }));

  const sidebarCollections = collections.map(collection => ({
    id: collection.id,
    title: collection.title,
    count: collection.flashcards.length,
    date: collection.date
  }));

  // Current View Title
  const currentViewTitle = selectedCollectionId 
    ? `Collection: ${getCollection(selectedCollectionId)?.title || 'Untitled'}`
    : 'Your Flashcards';

  if (contextLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
        <p style={{ marginLeft: '10px', color: 'white' }}>Loading your flashcards...</p>
      </div>
    );
  }
   
  return (
    <Layout className="app-container">
      <Sidebar 
        chats={sidebarChats} 
        collections={sidebarCollections}
        onChatSelect={handleChatSelect} 
        onCollectionSelect={handleCollectionSelect}
        onNewChat={handleNewChat} 
        onSaveCollection={handleSaveCollection}
        onDeleteChat={handleChatDelete}
        onDeleteCollection={handleCollectionDelete}
        selectedChatId={selectedChatId}
        selectedCollectionId={selectedCollectionId}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        headerContent={<UserProfile collapsed={sidebarCollapsed} />}
      />

      <Layout 
        className="site-layout"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}
      >
        <Header className="site-header">
          <Title level={1} style={{ textAlign: 'center', color: 'white', margin: 0, fontSize: '2rem' }}>
            The GST: AI Flashcard Generator
          </Title>
        </Header>

        <Content className="site-content">
          {!dbConnected && (
            <Alert
              message="Database Setup Required"
              description={
                <div>
                  <p>Your Supabase connection is working, but the required database tables don't exist yet.</p>
                  <p>Please create the database tables as described in the README.</p>
                  <p>The application will work in local memory mode until the database tables are set up.</p>
                </div>
              }
              type="warning"
              showIcon
              style={{ 
                marginBottom: '20px',
                backgroundColor: 'rgba(250, 173, 20, 0.1)',
                border: '1px solid #d48806'
              }}
            />
          )}

          <Row 
            gutter={[24, 24]} 
            justify="center" 
            style={{ width: '100%' }}
          >
            <Col xs={24} lg={10}>
              <div className="main-card">
                <Title level={2} style={{ textAlign: 'center', color: 'white', marginBottom: '24px', fontSize: '1.5rem' }}>
                  Create Flashcards
                </Title>
                
                <Tabs 
                  defaultActiveKey="chat" 
                  centered 
                  style={{ color: 'white' }} 
                  items={tabItems}
                  className="custom-tabs"
                />
                
                {selectedCollectionId && (
                  <div style={{ textAlign: 'center', margin: '20px 0', color: '#9CA3AF' }}>
                    <Paragraph>You are viewing a saved collection. Create a new chat to generate flashcards.</Paragraph>
                    <Button 
                      type="primary" 
                      onClick={handleNewChat}
                      style={{ marginTop: '10px' }}
                    >
                      Create New Chat
                    </Button>
                  </div>
                )}
                
                {isLoading && (
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <LoadingSpinner />
                  </div>
                )}
                
                {error && (
                  <div style={{ marginTop: '24px' }}>
                    <ErrorMessage message={error} onRetry={handleReset} />
                  </div>
                )}
                
                {chatHistory.length > 0 && selectedChatId && !selectedCollectionId && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #303030', padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <Title level={4} style={{ margin: 0, color: 'white' }}>Chat History</Title>
                      <span style={{ color: '#9CA3AF', marginLeft: '8px', fontSize: '14px' }}>
                        ({chatHistory.length} messages)
                      </span>
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '8px', backgroundColor: '#1A1A1A', borderRadius: '8px' }}>
                      {chatHistory.map((msg) => (
                        <div key={msg.id} style={{ 
                          marginBottom: '8px', 
                          padding: '8px', 
                          borderRadius: '4px',
                          backgroundColor: msg.role === 'user' ? '#2b3a61' : '#243342' 
                        }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '4px',
                            color: msg.role === 'user' ? '#b0c4ff' : '#7fc6ff'
                          }}>
                            {msg.role === 'user' ? 'You:' : 'AI:'}
                          </div>
                          <div style={{ color: '#e1e1e1', fontSize: '14px' }}>
                            {msg.role === 'assistant' 
                              ? msg.content.length > 100 
                                ? `${msg.content.substring(0, 100)}...` 
                                : msg.content
                              : msg.content
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
            
            <Col xs={24} lg={14}>
              <div className="flashcards-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Title level={2} style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>
                    {currentViewTitle}
                  </Title>
                  
                  {flashcards.length > 0 && (
                    <div>
                      {selectedChatId && !selectedCollectionId && (
                        <Button 
                          onClick={() => handleSaveCollection(selectedChatId)}
                          style={{ 
                            background: '#237804', 
                            borderColor: '#237804', 
                            color: 'white',
                            marginRight: '8px'
                          }}
                        >
                          Save as Collection
                        </Button>
                      )}
                      <Button 
                        onClick={handleReset}
                        style={{ background: '#333', borderColor: '#555', color: 'white' }}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
                
                <FlashcardList 
                  cards={flashcards} 
                  onReset={handleReset} 
                  showFullAnswer={!!fullAnswer}
                  fullAnswer={fullAnswer || ''}
                  onRegenerateComplete={() => {
                    if (selectedChatId) {
                      const currentChat = getCurrentChat();
                      if (currentChat) {
                        setFlashcards(currentChat.flashcards || []);
                      }
                    }
                  }}
                  onCardDelete={handleFlashcardDelete}
                  isLoading={isLoading}
                />
                
                {fullAnswer && (
                  <div style={{ marginTop: '24px' }}>
                    <Title level={3} style={{ color: 'white', fontSize: '1.2rem' }}>Full Answer</Title>
                    <div 
                      className="full-answer"
                      style={{ 
                        whiteSpace: 'pre-wrap',
                        background: '#1a1a1a',
                        padding: '16px',
                        borderRadius: '8px',
                        color: '#e1e1e1',
                        maxHeight: '500px',
                        overflowY: 'auto'
                      }}
                    >
                      {fullAnswer}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Content>
        
        <Footer style={{ textAlign: 'center', background: '#141414', color: '#9CA3AF', paddingBottom: '24px' }}>
          The GST AI Flashcard Generator ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  )
}

export default MainApp; 