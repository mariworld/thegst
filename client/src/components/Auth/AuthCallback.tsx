import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { supabase } from '../../lib/supabase';

const { Text } = Typography;

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during auth callback:', error);
          navigate('/auth', { replace: true });
          return;
        }
        
        if (data.session) {
          // Successfully authenticated
          navigate('/', { replace: true });
        } else {
          // No session found
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
        Completing your sign in...
      </Text>
    </div>
  );
};

export default AuthCallback; 