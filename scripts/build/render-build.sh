#!/bin/bash

# Exit on error
set -e

# Install dependencies
npm ci

# Create a production .env file with Render environment variables
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env.production
echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env.production
echo "VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY" >> .env.production

# Build the app
npm run build

# Make the server file executable
chmod +x server.js 