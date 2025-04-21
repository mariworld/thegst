import { useState } from 'react'
import { Flashcard as FlashcardType, ChatResponse } from './types'
import ChatInput from './components/ChatInput'
import FlashcardList from './components/FlashcardList'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import { generateFlashcards } from './api'
import { Layout, Typography, Row, Col } from 'antd'
import './App.css'

const { Header, Content, Footer } = Layout
const { Title, Paragraph } = Typography

function App() {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([])
  const [fullAnswer, setFullAnswer] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (question: string, count: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result: ChatResponse = await generateFlashcards(question, count)
      setFlashcards(result.flashcards)
      setFullAnswer(result.fullAnswer)
    } catch (err) {
      console.error('Error generating flashcards:', err)
      setError('Failed to generate flashcards. Please check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFlashcards([])
    setFullAnswer(undefined)
    setError(null)
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#141414' }}>
      <Header style={{ background: '#141414', padding: '36px 0 24px' }}>
        <Title level={1} style={{ textAlign: 'center', color: 'white', margin: 0, fontSize: '2.5rem' }}>
          The GST: AI Flashcard Generator
        </Title>
       
      </Header>

      <Content style={{ padding: '0 32px', marginTop: '32px', marginBottom: '48px' }}>
        <Row gutter={48} justify="center">
          <Col xs={24} lg={10} style={{ marginBottom: '32px' }}>
            <div style={{ 
              border: '1px solid #303030', 
              borderRadius: '12px', 
              padding: '32px',
              height: '100%',
              background: '#1f1f1f',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <Title level={2} style={{ textAlign: 'center', color: 'white', marginBottom: '32px', fontSize: '1.75rem' }}>
                Chat Bot
              </Title>
              <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
              
              {isLoading && (
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <LoadingSpinner />
                </div>
              )}
              
              {error && (
                <div style={{ marginTop: '32px' }}>
                  <ErrorMessage message={error} onRetry={handleReset} />
                </div>
              )}
            </div>
          </Col>
          
          <Col xs={24} lg={14}>
            <div style={{ 
              border: '1px solid #303030', 
              borderRadius: '12px', 
              padding: '32px',
              height: '650px',
              maxHeight: '650px', 
              background: '#1f1f1f',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <Title level={2} style={{ textAlign: 'center', color: 'white', marginBottom: '32px', fontSize: '1.75rem' }}>
                Your Flashcards
              </Title>
              <div style={{ flex: 1, overflow: 'auto', paddingTop: '16px' }}>
                {flashcards.length > 0 ? (
                  <FlashcardList 
                    cards={flashcards} 
                    onReset={handleReset} 
                    showFullAnswer={fullAnswer ? true : false}
                    fullAnswer={fullAnswer || ""}
                  />
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    border: '1px solid #303030', 
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <Paragraph style={{ color: '#9CA3AF', fontSize: '1.1rem' }}>
                      Ask a question in the chat to generate flashcards
                    </Paragraph>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: '#141414', 
        color: '#6B7280',
        padding: '24px',
        borderTop: '1px solid #303030'
      }}>
        © {new Date().getFullYear()} AI Flashcard Generator
      </Footer>
    </Layout>
  )
}

export default App
