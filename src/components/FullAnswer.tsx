import React, { useState } from 'react';
import { Button, Modal, Typography, Space } from 'antd';
import { ReadOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface FullAnswerProps {
  answer: string;
}

const FullAnswer: React.FC<FullAnswerProps> = ({ answer }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showModal = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <>
      <Button 
        onClick={showModal}
        icon={<ReadOutlined />}
        style={{ 
          backgroundColor: 'transparent', 
          borderColor: '#303030',
          color: 'white',
          height: 48,
          minWidth: 220,
          fontSize: '1rem',
          borderRadius: '8px'
        }}
      >
        Show Full Answer
      </Button>
      
      <Modal
        title={<Title level={4} style={{ color: 'white', textAlign: 'center', margin: 0 }}>Full Answer</Title>}
        open={isVisible}
        onCancel={handleClose}
        footer={[
          <Button 
            key="close" 
            onClick={handleClose}
            icon={<CloseOutlined />}
            style={{ 
              backgroundColor: '#111', 
              borderColor: '#303030',
              color: 'white',
              height: 40,
              fontSize: '1rem',
              borderRadius: '8px'
            }}
          >
            Close
          </Button>
        ]}
        centered
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ 
          maxHeight: '70vh', 
          overflow: 'auto',
          backgroundColor: '#1f1f1f',
          padding: '28px'
        }}
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
          content: { 
            backgroundColor: '#1f1f1f', 
            borderRadius: '12px',
            border: '1px solid #303030',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          },
          header: { 
            backgroundColor: '#1f1f1f',
            borderBottom: '1px solid #303030',
            padding: '20px 24px'
          }
        }}
        getContainer={() => document.body}
        destroyOnClose={true}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {answer.split('\n').map((paragraph, index) => (
            <Paragraph key={index} style={{ color: '#d9d9d9', fontSize: '16px', lineHeight: 1.6 }}>
              {paragraph}
            </Paragraph>
          ))}
        </Space>
      </Modal>
    </>
  );
};

export default FullAnswer; 