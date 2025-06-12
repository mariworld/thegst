import React, { useState } from 'react';
import { Card, Layout, Typography } from 'antd';
import Login from './Login';
import SignUp from './SignUp';
import './Auth.css';

const { Content } = Layout;
const { Title } = Typography;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <Card className="auth-card" bordered={false}>
          <Title level={4} style={{ textAlign: 'center', color: 'red', marginBottom: '1rem' }}>
            Deployment Test: v1
          </Title>
          {isLogin ? (
            <Login onRegisterClick={() => setIsLogin(false)} />
          ) : (
            <SignUp onLoginClick={() => setIsLogin(true)} />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default AuthPage; 