import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Check if connection is working
export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('chats').select('count');
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Unexpected error checking Supabase connection:', err);
    return false;
  }
};

// Debug function for authentication
export const checkAuthStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (user) {
    console.log('User is authenticated!', { 
      userId: user.id, 
      email: user.email,
      sessionExists: !!session,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'
    });
    
    // Test if the auth.uid() matches the user's ID by doing a simple query
    const { data, error } = await supabase.from('chats').select('count');
    if (error) {
      console.error('RLS test failed:', error);
    } else {
      console.log('Successfully queried with RLS policy');
    }
    
    return true;
  } else {
    console.error('No authenticated user found!');
    return false;
  }
};

// Initial connection check is commented out to prevent errors when tables don't exist
// The application code will handle database availability
// checkConnection(); 