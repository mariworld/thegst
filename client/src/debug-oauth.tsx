import React, { useState } from 'react';
import { Button, Card, Typography, Alert, Space, Divider } from 'antd';
import { supabase } from './lib/supabase';

const { Title, Text, Paragraph } = Typography;

interface DebugInfo {
  currentUrl?: string;
  redirectUrl?: string;
  supabaseUrl?: string;
  userAgent?: string;
  timestamp?: string;
  error?: string;
  sessionError?: string;
  success?: boolean;
  sessionExists?: boolean;
  userId?: string;
  userEmail?: string;
}

const DebugOAuth: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const testOAuthFlow = async () => {
    setLoading(true);
    try {
      // Get current environment info
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/auth/callback`;
      
      const info = {
        currentUrl,
        redirectUrl,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(info);
      
      console.log('OAuth Debug Info:', info);
      
      // Test the OAuth initiation
      console.log('Initiating Google OAuth...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        console.error('OAuth initiation error:', error);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      } else {
        console.log('OAuth initiated successfully');
        setDebugInfo(prev => ({ ...prev, success: true }));
      }
      
    } catch (error) {
      console.error('Unexpected error during OAuth test:', error);
      setDebugInfo(prev => ({ 
        ...prev, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setDebugInfo(prev => ({ ...prev, sessionError: error.message }));
      } else if (session) {
        console.log('Current session:', session);
        setDebugInfo(prev => ({ 
          ...prev, 
          sessionExists: true,
          userId: session.user.id,
          userEmail: session.user.email
        }));
      } else {
        console.log('No current session');
        setDebugInfo(prev => ({ ...prev, sessionExists: false }));
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>OAuth Debug Tool</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            onClick={testOAuthFlow}
            loading={loading}
            size="large"
          >
            Test Google OAuth Flow
          </Button>
          
          <Button 
            onClick={checkCurrentSession}
            size="large"
          >
            Check Current Session
          </Button>
          
          <Button 
            onClick={clearDebugInfo}
            size="large"
          >
            Clear Debug Info
          </Button>
        </Space>
      </Card>

      {debugInfo && (
        <Card title="Debug Information">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              <Text strong>Current URL:</Text> {debugInfo.currentUrl}
            </Paragraph>
            
            <Paragraph>
              <Text strong>Redirect URL:</Text> {debugInfo.redirectUrl}
            </Paragraph>
            
            <Paragraph>
              <Text strong>Supabase URL:</Text> {debugInfo.supabaseUrl}
            </Paragraph>
            
            <Paragraph>
              <Text strong>Timestamp:</Text> {debugInfo.timestamp}
            </Paragraph>

            {debugInfo.sessionExists !== undefined && (
              <Paragraph>
                <Text strong>Session Exists:</Text> {debugInfo.sessionExists ? 'Yes' : 'No'}
              </Paragraph>
            )}

            {debugInfo.userId && (
              <Paragraph>
                <Text strong>User ID:</Text> {debugInfo.userId}
              </Paragraph>
            )}

            {debugInfo.userEmail && (
              <Paragraph>
                <Text strong>User Email:</Text> {debugInfo.userEmail}
              </Paragraph>
            )}

            {debugInfo.error && (
              <Alert
                message="Error"
                description={debugInfo.error}
                type="error"
                showIcon
                style={{ marginTop: '10px' }}
              />
            )}

            {debugInfo.sessionError && (
              <Alert
                message="Session Error"
                description={debugInfo.sessionError}
                type="error"
                showIcon
                style={{ marginTop: '10px' }}
              />
            )}

            {debugInfo.success && (
              <Alert
                message="Success"
                description="OAuth flow initiated successfully"
                type="success"
                showIcon
                style={{ marginTop: '10px' }}
              />
            )}
          </Space>
        </Card>
      )}

      <Divider />
      
      <Card title="Common OAuth Issues & Solutions">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="Site URL Mismatch"
            description="Ensure your Supabase Site URL exactly matches your deployment URL: https://thegst-beta.vercel.app"
            type="warning"
            showIcon
          />
          
          <Alert
            message="Redirect URL Not Configured"
            description="Add https://thegst-beta.vercel.app/auth/callback to your Supabase redirect URLs"
            type="warning"
            showIcon
          />
          
          <Alert
            message="Google OAuth Credentials"
            description="Verify your Google OAuth credentials are correctly configured in both Google Cloud Console and Supabase"
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
};

export default DebugOAuth; 