import React, { useEffect, useState } from 'react';
import { Button, Card, Space, Typography, message, Alert, Divider, Tabs } from 'antd';
import { supabase } from './lib/supabase';
import { checkAuthStatus } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DebugAuth: React.FC = () => {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [collectionTestResults, setCollectionTestResults] = useState<any>(null);
  const auth = useAuth(); // Use the auth context
  
  const checkAuth = async () => {
    setLoading(true);
    try {
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userResponse } = await supabase.auth.getUser();
      
      const authData = {
        sessionExists: !!sessionData.session,
        userId: userResponse?.user?.id || 'none',
        email: userResponse?.user?.email || 'none',
        sessionExpires: sessionData.session?.expires_at 
          ? new Date(sessionData.session.expires_at * 1000).toLocaleString() 
          : 'N/A'
      };
      
      setAuthInfo(authData);
      
      if (authData.sessionExists) {
        message.success('User is authenticated');
      } else {
        message.error('No active session found');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      message.error('Error checking authentication status');
    } finally {
      setLoading(false);
    }
  };
  
  const testRLS = async () => {
    setLoading(true);
    const results = {
      select: { success: false, error: null, data: null },
      insert: { success: false, error: null, data: null },
      auth: { contextAvailable: !!auth.user, authUser: auth.user?.id || 'none' }
    };
    
    try {
      // Test SELECT query
      const { data: selectData, error: selectError } = await supabase
        .from('chats')
        .select('*')
        .limit(1);
      
      results.select.success = !selectError;
      results.select.error = selectError ? selectError.message : null;
      results.select.data = selectData;
      
      // Test INSERT query with a temporary chat (will be deleted)
      if (auth.user) {
        const testId = uuidv4();
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        console.log('Attempting INSERT with:', {
          id: testId,
          user_id: auth.user.id,
          date: formattedDate
        });
        
        const { data: insertData, error: insertError } = await supabase
          .from('chats')
          .insert({
            id: testId,
            title: 'Test Chat (Debug)',
            date: formattedDate,
            question: '',
            user_id: auth.user.id,
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .select();
          
        results.insert.success = !insertError;
        results.insert.error = insertError ? insertError.message : null;
        results.insert.data = insertData;
        
        // Clean up - delete the test chat
        if (!insertError) {
          await supabase.from('chats').delete().eq('id', testId);
        }
      } else {
        results.insert.error = 'Test skipped - no authenticated user';
      }
      
      setTestResults(results);
      
      if (results.select.success && results.insert.success) {
        message.success('All tests passed successfully!');
      } else if (results.select.success) {
        message.warning('SELECT test passed, but INSERT test failed');
      } else {
        message.error('RLS tests failed');
      }
    } catch (error: any) {
      console.error('Error testing RLS:', error);
      setTestResults({
        ...results,
        error: error.message || 'Unknown error occurred'
      });
      message.error('Error testing RLS policies');
    } finally {
      setLoading(false);
    }
  };
  
  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        message.error(`Failed to refresh session: ${error.message}`);
      } else if (data.session) {
        message.success('Session refreshed successfully');
        checkAuth(); // Update the auth info
      } else {
        message.warning('No session to refresh. Please log in first.');
      }
    } catch (error: any) {
      message.error(`Error refreshing session: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Add this function to test if auth.uid() is working correctly
  const testAuthUid = async () => {
    setLoading(true);
    try {
      // Execute a query that directly references auth.uid()
      const { data: uidData, error: uidError } = await supabase.rpc('check_auth_uid_match');
      
      if (uidError) {
        console.error('Error testing auth.uid():', uidError);
        message.error(`Auth UID test failed: ${uidError.message}`);
        return;
      }
      
      console.log('Auth UID test result:', uidData);
      message.info(`Auth UID: ${uidData.auth_uid}, Is authenticated: ${uidData.is_authenticated}`);
      
      // Also test insert via RPC
      const { data: insertData, error: insertError } = await supabase.rpc('test_insert_chat');
      
      if (insertError) {
        console.error('Error testing insert via RPC:', insertError);
        message.error(`Insert test via RPC failed: ${insertError.message}`);
        return;
      }
      
      console.log('Insert test via RPC result:', insertData);
      
      if (insertData.success) {
        message.success('Insert test via RPC successful!');
      } else {
        message.error(`Insert test failed: ${insertData.error}`);
      }
    } catch (error: any) {
      console.error('Error executing auth.uid test:', error);
      message.error(`Error testing auth.uid: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // New function to test collection insert with user_id
  const testCollectionInsert = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: userResponse } = await supabase.auth.getUser();
      
      console.log('Testing collection insert with auth info:', {
        sessionExists: !!session,
        userId: userResponse?.user?.id || 'none',
        email: userResponse?.user?.email || 'none'
      });
      
      // First test auth.uid directly using the existing function
      const { data: uidData } = await supabase.rpc('check_auth_uid_match');
      console.log('auth.uid() check result:', uidData);
      
      if (!userResponse?.user?.id) {
        console.error('No authenticated user found!');
        return { success: false, error: 'No authenticated user found' };
      }
      
      // Try to insert a test collection
      const testId = uuidv4();
      const now = new Date();
      
      const { data, error } = await supabase
        .from('collections')
        .insert({
          id: testId,
          title: 'Test Collection',
          date: now.toISOString(),
          user_id: userResponse.user.id,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select();
      
      // Delete the test collection regardless of success/failure
      await supabase.from('collections').delete().eq('id', testId);
      
      if (error) {
        console.error('Error inserting test collection:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Successfully inserted test collection');
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error in test:', error);
      return { success: false, error: String(error) };
    }
  };
  
  const handleTestCollectionInsert = async () => {
    setLoading(true);
    try {
      const results = await testCollectionInsert();
      setCollectionTestResults(results);
      
      if (results.success) {
        message.success('Successfully tested collection insert');
      } else {
        message.error('Collection insert test failed: ' + results.error);
      }
    } catch (error) {
      console.error('Error testing collection insert:', error);
      message.error('Unexpected error during test');
    } finally {
      setLoading(false);
    }
  };
  
  // New function to test chat deletion directly
  const testChatDeletion = async () => {
    try {
      // Get the current session and user directly
      const { data: { session } } = await supabase.auth.getSession();
      const { data: userResponse } = await supabase.auth.getUser();
      
      if (!userResponse?.user?.id) {
        console.error('No authenticated user found!');
        return { success: false, error: 'No authenticated user found' };
      }
      
      // First create a test chat
      const testId = uuidv4();
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      console.log('Creating test chat with ID:', testId);
      
      // Insert test chat
      const { data: insertData, error: insertError } = await supabase
        .from('chats')
        .insert({
          id: testId,
          title: 'Test Chat for Deletion',
          date: formattedDate,
          question: 'Test question',
          user_id: userResponse.user.id,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select();
        
      if (insertError) {
        console.error('Error creating test chat:', insertError);
        return { success: false, error: `Error creating test chat: ${insertError.message}` };
      }
      
      console.log('Successfully created test chat:', insertData);
      
      // Now try to delete it
      const { data: deleteData, error: deleteError } = await supabase
        .from('chats')
        .delete()
        .eq('id', testId)
        .select();
        
      if (deleteError) {
        console.error('Error deleting test chat:', deleteError);
        return { 
          success: false, 
          error: `Error deleting test chat: ${deleteError.message}`,
          chat: insertData
        };
      }
      
      console.log('Successfully deleted test chat:', deleteData);
      
      // Verify deletion by trying to fetch the chat
      const { data: verifyData, error: verifyError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', testId);
        
      if (verifyError) {
        console.error('Error verifying deletion:', verifyError);
        return { 
          success: false, 
          error: `Error verifying deletion: ${verifyError.message}` 
        };
      }
      
      const verified = !verifyData || verifyData.length === 0;
      console.log('Verified deletion:', verified, verifyData);
      
      return {
        success: verified,
        deletion_response: deleteData,
        verification: verifyData
      };
    } catch (error) {
      console.error('Unexpected error in test:', error);
      return { success: false, error: String(error) };
    }
  };
  
  const handleTestChatDeletion = async () => {
    setLoading(true);
    try {
      const results = await testChatDeletion();
      setTestResults({...testResults, chatDeletion: results});
      
      if (results.success) {
        message.success('Successfully tested chat deletion');
      } else {
        message.error('Chat deletion test failed: ' + results.error);
      }
    } catch (error) {
      console.error('Error testing chat deletion:', error);
      message.error('Unexpected error during chat deletion test');
    } finally {
      setLoading(false);
    }
  };
  
  // New function to test collection deletion directly
  const testCollectionDeletion = async () => {
    try {
      // Get the current session and user directly
      const { data: { session } } = await supabase.auth.getSession();
      const { data: userResponse } = await supabase.auth.getUser();
      
      if (!userResponse?.user?.id) {
        console.error('No authenticated user found!');
        return { success: false, error: 'No authenticated user found' };
      }
      
      // First create a test collection
      const testId = uuidv4();
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      console.log('Creating test collection with ID:', testId);
      
      // Insert test collection
      const { data: insertData, error: insertError } = await supabase
        .from('collections')
        .insert({
          id: testId,
          title: 'Test Collection for Deletion',
          date: formattedDate,
          source: null,
          user_id: userResponse.user.id,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select();
        
      if (insertError) {
        console.error('Error creating test collection:', insertError);
        return { success: false, error: `Error creating test collection: ${insertError.message}` };
      }
      
      console.log('Successfully created test collection:', insertData);
      
      // Now try to delete it
      const { data: deleteData, error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', testId)
        .select();
        
      if (deleteError) {
        console.error('Error deleting test collection:', deleteError);
        return { 
          success: false, 
          error: `Error deleting test collection: ${deleteError.message}`,
          collection: insertData
        };
      }
      
      console.log('Successfully deleted test collection:', deleteData);
      
      // Verify deletion by trying to fetch the collection
      const { data: verifyData, error: verifyError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', testId);
        
      if (verifyError) {
        console.error('Error verifying deletion:', verifyError);
        return { 
          success: false, 
          error: `Error verifying deletion: ${verifyError.message}` 
        };
      }
      
      const verified = !verifyData || verifyData.length === 0;
      console.log('Verified collection deletion:', verified, verifyData);
      
      return {
        success: verified,
        deletion_response: deleteData,
        verification: verifyData
      };
    } catch (error) {
      console.error('Unexpected error in test:', error);
      return { success: false, error: String(error) };
    }
  };
  
  const handleTestCollectionDeletion = async () => {
    setLoading(true);
    try {
      const results = await testCollectionDeletion();
      setTestResults({...testResults, collectionDeletion: results});
      
      if (results.success) {
        message.success('Successfully tested collection deletion');
      } else {
        message.error('Collection deletion test failed: ' + results.error);
      }
    } catch (error) {
      console.error('Error testing collection deletion:', error);
      message.error('Unexpected error during collection deletion test');
    } finally {
      setLoading(false);
    }
  };
  
  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <div 
      style={{ 
        maxWidth: 800, 
        margin: '40px auto', 
        padding: '0 20px', 
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Card style={{ flex: 1, overflow: 'auto' }}>
        <Title level={2}>Auth Debugging</Title>
        
        {!authInfo?.sessionExists && (
          <Alert
            type="error"
            message="Authentication Issue Detected"
            description="You are not logged in or your session has expired. This explains why RLS policies are failing. Please sign in first."
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Tabs defaultActiveKey="status">
          <TabPane tab="Authentication Status" key="status">
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <Card title="Authentication Status" size="small" style={{ marginBottom: 16 }}>
                {authInfo ? (
                  <>
                    <Paragraph><strong>Session Active:</strong> {authInfo.sessionExists ? 'Yes ✅' : 'No ❌'}</Paragraph>
                    <Paragraph><strong>User ID:</strong> {authInfo.userId}</Paragraph>
                    <Paragraph><strong>Email:</strong> {authInfo.email}</Paragraph>
                    <Paragraph><strong>Session Expires:</strong> {authInfo.sessionExpires}</Paragraph>
                  </>
                ) : (
                  <Text>No auth data. Click "Check Auth Status" to test.</Text>
                )}
              </Card>
              
              <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={checkAuth} loading={loading}>
                  Check Auth Status
                </Button>
                
                <Button onClick={testRLS} loading={loading}>
                  Test RLS Policies
                </Button>
                
                <Button onClick={refreshSession} loading={loading}>
                  Refresh Session
                </Button>
                
                <Button onClick={testAuthUid} loading={loading}>
                  Test Auth UID
                </Button>

                <Button onClick={handleTestChatDeletion} loading={loading}>
                  Test Chat Deletion
                </Button>

                <Button onClick={handleTestCollectionDeletion} loading={loading}>
                  Test Collection Deletion
                </Button>
              </Space>
              
              {testResults && testResults.chatDeletion && (
                <Card title="Chat Deletion Test Results" size="small" style={{ marginBottom: 16 }}>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(testResults.chatDeletion, null, 2)}
                  </pre>
                </Card>
              )}
              
              {testResults && (
                <Card title="RLS Test Results" size="small" style={{ marginBottom: 16 }}>
                  <Paragraph><strong>Auth Context Available:</strong> {testResults.auth.contextAvailable ? 'Yes ✅' : 'No ❌'}</Paragraph>
                  <Paragraph><strong>Auth Context User ID:</strong> {testResults.auth.authUser}</Paragraph>
                  
                  <Divider orientation="left">SELECT Test</Divider>
                  <Paragraph><strong>Success:</strong> {testResults.select.success ? 'Yes ✅' : 'No ❌'}</Paragraph>
                  {testResults.select.error && (
                    <Paragraph><strong>Error:</strong> {testResults.select.error}</Paragraph>
                  )}
                  
                  <Divider orientation="left">INSERT Test</Divider>
                  <Paragraph><strong>Success:</strong> {testResults.insert.success ? 'Yes ✅' : 'No ❌'}</Paragraph>
                  {testResults.insert.error && (
                    <Paragraph><strong>Error:</strong> {testResults.insert.error}</Paragraph>
                  )}
                </Card>
              )}
            </div>
          </TabPane>
          
          <TabPane tab="Troubleshooting" key="troubleshooting">
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <Card title="Auth Troubleshooting" size="small">
                <Title level={4}>Common RLS Issues:</Title>
                <Paragraph>
                  1. <strong>No active session</strong> - The user needs to sign in
                </Paragraph>
                <Paragraph>
                  2. <strong>Missing user_id</strong> - Database operations need to include the user_id
                </Paragraph>
                <Paragraph>
                  3. <strong>Incorrect RLS policies</strong> - Check scripts/auth-migrations.sql
                </Paragraph>
                <Paragraph>
                  4. <strong>Expired session</strong> - Session token has expired, need to refresh or re-login
                </Paragraph>
                
                <Divider />
                
                <Title level={4}>Fixing the "new row violates row-level security policy" Error:</Title>
                <Paragraph>
                  Since you're seeing this specific error, and you're authenticated with an active session, it's likely a problem with:
                </Paragraph>
                
                <ol>
                  <li>
                    <strong>Auth.uid() not matching your user_id</strong> - Check the result of the "Test Auth UID" function. The auth.uid() value should match your user ID.
                  </li>
                  <li>
                    <strong>RLS policy configuration</strong> - The "Users can insert their own chats" policy needs to permit your user to insert rows.
                  </li>
                  <li>
                    <strong>Schema differences</strong> - The database schema might require additional fields that aren't being provided (like question being required).
                  </li>
                </ol>
                
                <Paragraph>
                  Try running these SQL commands in the Supabase SQL Editor to verify your RLS policies:
                </Paragraph>
                <pre style={{ background: '#f5f5f5', padding: '8px', overflowX: 'auto' }}>
              {`-- Check your RLS policies
              SELECT * FROM pg_policies WHERE tablename = 'chats';
              
              -- Check your role
              SELECT current_setting('request.jwt.claims', true)::jsonb->>'role';
              
              -- Reset RLS policies
              DROP POLICY IF EXISTS "Users can insert their own chats" ON chats;
              CREATE POLICY "Users can insert their own chats" 
                ON chats FOR INSERT 
                WITH CHECK (auth.uid() = user_id);
              `}
                </pre>
                
                <Divider />
                
                <Title level={4}>Fixing Steps:</Title>
                <Paragraph>
                  1. <strong>Sign out and sign in again</strong> to get a fresh session
                </Paragraph>
                <Paragraph>
                  2. <strong>Check browser console</strong> for more detailed error messages
                </Paragraph>
                <Paragraph>
                  3. <strong>Verify that user_id is included</strong> in all database operations
                </Paragraph>
                <Paragraph>
                  4. <strong>Use the "Refresh Session" button</strong> if the session has expired
                </Paragraph>
              </Card>
            </div>
          </TabPane>
          
          <TabPane tab="SQL Fixes" key="sql">
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <Card title="SQL Fixes" size="small">
                <Paragraph>
                  Run the following SQL commands in your Supabase SQL Editor to fix common RLS issues:
                </Paragraph>
                
                <Title level={5}>1. Check Current RLS Policies</Title>
                <pre style={{ background: '#f5f5f5', padding: '8px', overflowX: 'auto' }}>
                {`SELECT * FROM pg_policies WHERE tablename = 'chats';`}
                </pre>
                
                <Title level={5}>2. Reset Conflicting Policies</Title>
                <pre style={{ background: '#f5f5f5', padding: '8px', overflowX: 'auto' }}>
                {`-- Remove any existing policies for the chats table
                DROP POLICY IF EXISTS "Allow all operations on chats" ON chats;
                DROP POLICY IF EXISTS "Users can insert their own chats" ON chats;
                
                -- Create a fresh policy for inserts (permissive for testing)
                CREATE POLICY "Users can insert their own chats" 
                  ON chats FOR INSERT 
                  WITH CHECK (auth.uid() = user_id);
                
                -- Create a fresh policy for selects
                CREATE POLICY "Users can view their own chats" 
                  ON chats FOR SELECT 
                  USING (auth.uid() = user_id);`}
                </pre>
                
                <Title level={5}>3. Test Auth Functions</Title>
                <pre style={{ background: '#f5f5f5', padding: '8px', overflowX: 'auto' }}>
                {`-- Create a function to test if auth.uid() is working correctly
CREATE OR REPLACE FUNCTION check_auth_uid_match() 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  result := jsonb_build_object(
    'auth_uid', auth.uid()::text, 
    'is_authenticated', auth.uid() IS NOT NULL,
    'role', current_setting('request.jwt.claims', true)::jsonb->>'role',
    'jwt_exp', current_setting('request.jwt.claims', true)::jsonb->>'exp'
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION check_auth_uid_match() TO authenticated, anon;

-- Create a function to directly test chat insert permission
CREATE OR REPLACE FUNCTION test_insert_chat() 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_id uuid := gen_random_uuid();
  result jsonb;
  success boolean;
  error_message text;
BEGIN
  BEGIN
    INSERT INTO chats (id, title, date, question, user_id, created_at, updated_at)
    VALUES (
      test_id, 
      'Test Chat',
      CURRENT_DATE::text,
      '',
      auth.uid(),
      NOW(),
      NOW()
    );
    success := true;
    error_message := null;
  EXCEPTION WHEN OTHERS THEN
    success := false;
    error_message := SQLERRM;
  END;
  
  -- Clean up
  DELETE FROM chats WHERE id = test_id;
  
  result := jsonb_build_object(
    'success', success, 
    'error', error_message,
    'auth_uid', auth.uid()::text
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION test_insert_chat() TO authenticated, anon;`}
                </pre>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>
      <Button 
        onClick={handleTestCollectionInsert} 
        loading={loading}
        type="primary"
        style={{ marginTop: '16px' }}
      >
        Test Collection Insert
      </Button>

      {collectionTestResults && (
        <Card title="Collection Insert Test Results" style={{ marginTop: '16px' }}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(collectionTestResults, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default DebugAuth; 