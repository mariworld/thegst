import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  console.error('Required environment variables:');
  console.error('- SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up Supabase database tables...');
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  
  try {
    // Read the SQL file
    const sqlScript = fs.readFileSync(path.join(__dirname, 'db-setup.sql'), 'utf8');
    
    // Split the SQL script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement through the Supabase REST API using SQL queries
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Use the SQL API to execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql_query: `${statement};` });
        
        if (error) {
          if (error.message.includes('function "exec_sql" does not exist')) {
            console.error('❌ The exec_sql function is not available in your Supabase project.');
            console.error('Please use the Supabase web interface SQL editor to run the SQL commands.');
            console.error(`SQL file path: ${path.join(__dirname, 'db-setup.sql')}`);
            process.exit(1);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`❌ Exception executing statement ${i + 1}:`, error.message);
      }
    }
    
    // Verify tables exist
    const tables = ['chats', 'collections', 'flashcards', 'chat_messages'];
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist
          console.error(`❌ Table '${table}' does not exist.`);
          allTablesExist = false;
        } else if (error) {
          console.error(`❌ Error checking table ${table}:`, error.message);
          allTablesExist = false;
        } else {
          console.log(`✅ Table '${table}' exists.`);
        }
      } catch (error) {
        console.error(`❌ Exception checking table ${table}:`, error.message);
        allTablesExist = false;
      }
    }
    
    if (allTablesExist) {
      console.log('✅ All tables were created successfully.');
    } else {
      console.log('\n❌ Some tables were not created. Alternative methods to set up the database:');
      console.log('1. Use the Supabase web interface SQL Editor to run the SQL script directly.');
      console.log('2. Execute the SQL commands using the Supabase CLI.');
      console.log(`SQL file path: ${path.join(__dirname, 'db-setup.sql')}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

setupDatabase(); 