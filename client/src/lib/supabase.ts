import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Environment variables are loaded silently

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your Vercel environment variables.');
  // Provide a more helpful error for the developer.
  alert('Supabase credentials are not configured. The application will not work. Please check the Vercel deployment settings.');
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

    
    // Test if the auth.uid() matches the user's ID by doing a simple query
    const { error } = await supabase.from('chats').select('count');
    if (error) {
      console.error('RLS test failed:', error);
    } else {

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