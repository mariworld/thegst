// This script checks if your Supabase database tables are properly set up
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tables to check
const tables = ['chats', 'collections', 'flashcards', 'chat_messages'];

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('count');
    
    if (error) {
      if (error.code === '42P01') { // Table does not exist code
        console.error(`❌ Table '${tableName}' does not exist`);
        return false;
      } else {
        console.error(`❌ Error checking table '${tableName}':`, error);
        return false;
      }
    }
    
    console.log(`✅ Table '${tableName}' exists`);
    return true;
  } catch (err) {
    console.error(`❌ Unexpected error checking table '${tableName}':`, err);
    return false;
  }
}

async function checkAllTables() {
  console.log('Checking Supabase database setup...');
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  
  let allTablesExist = true;
  
  for (const table of tables) {
    const exists = await checkTable(table);
    if (!exists) {
      allTablesExist = false;
    }
  }
  
  if (allTablesExist) {
    console.log('\n✅ All tables exist! Your database is properly set up.');
  } else {
    console.log('\n❌ Some tables are missing. Please run the setup script to create them.');
    console.log('See instructions in the README.md file under "Setting up the database"');
  }
}

checkAllTables(); 