import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 300 
    }}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} 
        size="large" 
      />
      <Text style={{ marginTop: 16, color: '#9CA3AF' }}>
        Generating your flashcards...
      </Text>
    </div>
  );
};

export default LoadingSpinner; 