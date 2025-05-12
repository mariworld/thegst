import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, message, Alert } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface LoginProps {
  onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const { signIn, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      setEmail(values.email);
      const { error } = await signIn(values.email, values.password);
      if (error) {
        // Check if the error is related to email confirmation
        if (error.message?.toLowerCase().includes('email') && 
            error.message?.toLowerCase().includes('confirm')) {
          setEmailConfirmationRequired(true);
          message.warning('Please confirm your email address before signing in');
        } else {
          message.error(error.message || 'Failed to sign in');
          setEmailConfirmationRequired(false);
        }
      } else {
        setEmailConfirmationRequired(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      message.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <Title level={2} className="text-center">
        Sign In to GST Flashcards
      </Title>
      <Text type="secondary" className="text-center block mb-6">
        Sign in to access your flashcards and study materials
      </Text>

      {emailConfirmationRequired && (
        <Alert
          message="Email Confirmation Required"
          description={
            <div>
              <p>We've sent a confirmation email to <strong>{email}</strong>.</p>
              <p>Please check your inbox and click the confirmation link before signing in.</p>
              <p>If you don't see the email, please check your spam folder.</p>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      <Form
        name="login"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
            loading={loading}
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>or</Divider>

      <Button
        icon={<GoogleOutlined />}
        block
        onClick={handleGoogleSignIn}
        loading={loading}
        className="google-sign-in-button"
      >
        Sign in with Google
      </Button>

      <div className="auth-footer">
        <Text>
          Don't have an account?{" "}
          <Button type="link" onClick={onRegisterClick} className="p-0">
            Sign up
          </Button>
        </Text>
      </div>
    </div>
  );
};

export default Login; 