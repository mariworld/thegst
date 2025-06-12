import React from 'react';
import { Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert
        message="Error"
        description={message}
        type="error"
        showIcon
        style={{ 
          border: '1px solid #5c0011',
          background: 'rgba(68, 7, 7, 0.25)'
        }}
      />
      <Button 
        danger 
        onClick={onRetry}
        icon={<ReloadOutlined />}
        style={{ marginTop: 16 }}
      >
        Try Again
      </Button>
    </Space>
  );
};

export default ErrorMessage; 