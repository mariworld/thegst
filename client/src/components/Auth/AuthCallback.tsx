import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin, Typography, Alert, Button } from 'antd';
import { supabase } from '../../lib/supabase';

const { Text, Title } = Typography;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Log the current URL for debugging
        console.log('Auth callback URL:', window.location.href);
        console.log('Location search:', location.search);
        console.log('Location hash:', location.hash);

        // Check for error in URL parameters first (both query params and hash)
        const urlParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove the # 
        
        const errorParam = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        
        if (errorParam) {
          const errorMsg = `OAuth Error: ${errorParam}${errorDescription ? ` - ${errorDescription}` : ''}`;
          console.error(errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        // Check if we have OAuth tokens in the URL hash (Supabase OAuth callback format)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          console.log('Found OAuth tokens in URL, processing...');
          
          // Let Supabase handle the OAuth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session after OAuth:', error);
            setError(`Failed to establish session: ${error.message}`);
            setIsLoading(false);
            return;
          }
          
          if (data.session) {
            console.log('OAuth session established successfully');
            navigate('/', { replace: true });
            return;
          } else {
            console.log('No session found, trying to refresh...');
            // Sometimes we need to wait a moment for Supabase to process the tokens
            setTimeout(async () => {
              const { data: retryData } = await supabase.auth.getSession();
              if (retryData.session) {
                navigate('/', { replace: true });
              } else {
                setError('Failed to create session from OAuth tokens');
                setIsLoading(false);
              }
            }, 1000);
            return;
          }
        }

        // Fallback: Process the OAuth callback normally
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase auth error during callback:', error);
          setError(`Authentication failed: ${error.message}`);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          // Successfully authenticated
          console.log('Authentication successful, redirecting to home');
          navigate('/', { replace: true });
        } else {
          // No session found - this might be normal for some OAuth flows
          console.log('No session found, checking if auth is in progress...');
          
          // Wait a moment and try again (sometimes auth takes a moment)
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            
            if (retryError) {
              console.error('Retry auth error:', retryError);
              setError(`Authentication failed on retry: ${retryError.message}`);
              setIsLoading(false);
              return;
            }
            
            if (retryData.session) {
              navigate('/', { replace: true });
            } else {
              setError('No session was created. Please try signing in again.');
              setIsLoading(false);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  const handleRetry = () => {
    navigate('/auth', { replace: true });
  };

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <Title level={3} style={{ color: '#ff4d4f' }}>
          Authentication Error
        </Title>
        
        <Alert
          message="Sign In Failed"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px', width: '100%' }}
        />
        
        <Button type="primary" onClick={handleRetry}>
          Try Again
        </Button>
        
        <Text type="secondary" style={{ marginTop: '10px', textAlign: 'center' }}>
          If this problem persists, please check your authentication configuration.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh'
    }}>
      <Spin size="large" />
      <Text style={{ marginTop: '20px' }}>
        {isLoading ? 'Completing your sign in...' : 'Processing authentication...'}
      </Text>
    </div>
  );
};

export default AuthCallback; 