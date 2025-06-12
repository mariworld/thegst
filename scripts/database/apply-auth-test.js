// Script to apply the check-auth.sql to your Supabase database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAuthTestScript() {
  try {
    console.log('Reading auth test SQL script...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'check-auth.sql'), 'utf8');

    console.log('Applying SQL script to database...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });

    if (error) {
      console.error('Error applying SQL script:', error);
      
      // If the exec_sql function doesn't exist, explain how to run the script
      if (error.message.includes('function exec_sql() does not exist')) {
        console.log('\nThe exec_sql function does not exist in your Supabase instance.');
        console.log('Please run this SQL script directly in the Supabase SQL editor:');
        console.log('\n--------------------------------------------');
        console.log(sqlScript);
        console.log('--------------------------------------------\n');
      }
      
      process.exit(1);
    }

    console.log('Auth test functions created successfully!');
    console.log('You can now use the "Test Auth UID" button in the Debug Auth page.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

applyAuthTestScript(); 