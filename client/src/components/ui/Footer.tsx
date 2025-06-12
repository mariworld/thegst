import React from 'react';
import { Layout, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center', 
      backgroundColor: '#141414', 
      borderTop: '1px solid #303030',
      padding: '12px 24px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{ color: '#8c8c8c' }}>
        Flashcard App © {new Date().getFullYear()} | 
        <Link href="https://github.com/yourusername/flashcard-app" target="_blank" style={{ marginLeft: '8px' }}>
          <GithubOutlined /> Source
        </Link>
      </Text>
    </AntFooter>
  );
};

export default Footer; 