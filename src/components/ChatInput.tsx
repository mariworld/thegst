import React, { useState, KeyboardEvent } from 'react';
import { Form, Input, Slider, Button, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface ChatInputProps {
  onSubmit: (question: string, count: number) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [count, setCount] = useState(3);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    if (question.trim() && count >= 1 && count <= 10) {
      onSubmit(question, count);
      setQuestion(''); // Clear the input after submission
      form.resetFields(['question']); // Reset the form field
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without holding shift (shift+enter allows for newlines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid adding a new line
      if (question.trim() && count >= 1 && count <= 10 && !isLoading) {
        handleSubmit();
      }
    }
  };

  return (
    <Form 
      form={form}
      layout="vertical" 
      onFinish={handleSubmit}
      style={{ width: '100%' }}
    >
      <Form.Item
        label={<Text style={{ color: '#9CA3AF', textAlign: 'center', display: 'block', fontSize: '1rem', marginBottom: '8px' }}>Ask a question:</Text>}
        name="question"
        rules={[{ required: true, message: 'Please enter your question' }]}
        style={{ marginBottom: '28px' }}
      >
        <TextArea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your question here... (Press Enter to submit)"
          autoSize={{ minRows: 4, maxRows: 8 }}
          style={{ 
            backgroundColor: '#141414', 
            borderColor: '#303030',
            color: 'white',
            padding: '12px',
            fontSize: '1rem',
            borderRadius: '8px'
          }}
        />
      </Form.Item>
      
      <Form.Item
        label={<Text style={{ color: '#9CA3AF', textAlign: 'center', display: 'block', fontSize: '1rem', marginBottom: '8px' }}>Number of flashcards (1-10):</Text>}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <Slider
            min={1}
            max={10}
            value={count}
            onChange={setCount}
            style={{ flex: 1, marginRight: 16 }}
            railStyle={{ backgroundColor: '#303030' }}
            trackStyle={{ backgroundColor: '#4B5563' }}
            handleStyle={{ borderColor: '#4B5563', backgroundColor: '#9CA3AF' }}
          />
          <Text style={{ color: 'white', width: 20, textAlign: 'center', fontSize: '1rem' }}>{count}</Text>
        </div>
      </Form.Item>
      
      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isLoading || !question.trim()}
          loading={isLoading}
          icon={<SendOutlined />}
          style={{ 
            width: '100%', 
            height: 48,
            backgroundColor: isLoading || !question.trim() ? undefined : '#111',
            borderColor: '#303030',
            fontSize: '1rem',
            borderRadius: '8px'
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Flashcards'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChatInput; 