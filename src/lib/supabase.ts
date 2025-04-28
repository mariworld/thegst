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

// Initial connection check is commented out to prevent errors when tables don't exist
// The application code will handle database availability
// checkConnection(); 