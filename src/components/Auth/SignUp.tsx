import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, message, Alert } from 'antd';
import { GoogleOutlined, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

interface SignUpProps {
  onLoginClick: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onLoginClick }) => {
  const { signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const { error } = await signUp(values.email, values.password);
      if (error) {
        message.error(error.message || 'Failed to sign up');
        setSignupSuccess(false);
      } else {
        setSignupEmail(values.email);
        setSignupSuccess(true);
        message.success('Sign up successful! Please check your email to confirm your account.', 5);
        // Not redirecting to login immediately to allow user to read the confirmation instructions
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
      message.error('Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="auth-form-container">
        <Title level={2} className="text-center">
          Email Confirmation Required
        </Title>
        
        <Alert
          message="Verify Your Email Address"
          description={
            <div>
              <p>We've sent a confirmation email to <strong>{signupEmail}</strong>.</p>
              <p>Please check your inbox and click the confirmation link to activate your account.</p>
              <p>If you don't see the email within a few minutes, check your spam folder.</p>
              <p>You won't be able to sign in until you confirm your email address.</p>
            </div>
          }
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Button 
          type="primary" 
          onClick={onLoginClick} 
          block
        >
          Return to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <Title level={2} className="text-center">
        Create Your Account
      </Title>
      <Text type="secondary" className="text-center block mb-6">
        Sign up to create and manage your flashcards
      </Text>

      <Form
        name="register"
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
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Sign Up
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
        Sign up with Google
      </Button>

      <div className="auth-footer">
        <Text>
          Already have an account?{" "}
          <Button type="link" onClick={onLoginClick} className="p-0">
            Sign in
          </Button>
        </Text>
      </div>
    </div>
  );
};

export default SignUp; 