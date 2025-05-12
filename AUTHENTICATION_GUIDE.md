# Authentication Implementation Guide

This guide explains how authentication has been implemented in the GST Flashcard Generator application and how to use it.

## Overview

We've implemented a complete authentication system with:

1. Email/password authentication
2. Google OAuth authentication
3. Per-user data isolation
4. Protected routes

## Key Components

### 1. Auth Context

The `AuthContext` (`src/context/AuthContext.tsx`) provides authentication state and methods throughout the application:

- `session`: Current user's session
- `user`: Current user's data
- `signUp`: Register new users
- `signIn`: Login with email/password
- `signInWithGoogle`: Login with Google
- `signOut`: Logout

### 2. Auth Components

- `AuthPage`: Main authentication page that toggles between login and register views
- `Login`: Email/password login form with Google login option
- `SignUp`: Registration form
- `AuthCallback`: Handles OAuth redirect callbacks
- `ProtectedRoute`: Route wrapper that redirects unauthenticated users

### 3. Database Security

We use Supabase Row Level Security (RLS) policies to ensure each user can only access their own data. The policies are defined in `scripts/auth-migrations.sql`.

### 4. User Profile

The `UserProfile` component displays the current user's information and provides a sign-out button.

## Setup Steps

1. **Configure Supabase Authentication**
   - In your Supabase project, go to Authentication → Settings
   - Set Site URL to your application URL
   - Enable Email provider with "Confirm email" option
   - Go to Authentication → Providers
   - Enable Google provider by adding OAuth credentials from Google Cloud Console

2. **Apply Database Migrations**
   - Run the SQL commands in `scripts/auth-migrations.sql` in your Supabase SQL editor

3. **Environment Variables**
   - Ensure your `.env` file has the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

## Using Authentication

### Sign Up
Users can register by:
1. Navigating to the `/auth` route
2. Clicking the "Sign up" link
3. Completing the registration form
4. Confirming their email address (if configured)

### Sign In
Users can login by:
1. Navigating to the `/auth` route
2. Entering their email and password
3. Alternatively, clicking "Sign in with Google"

### Protected Content
Once authenticated:
1. Users are redirected to the main application
2. They can only see and manage their own flashcards
3. All data operations are associated with their user ID

### Sign Out
Users can logout by:
1. Clicking their profile in the sidebar
2. Clicking the "Sign Out" button

## Troubleshooting

- **OAuth Redirection Issues**: Ensure your site URL is correctly configured in Supabase
- **Missing User Data**: Check that RLS policies are correctly applied
- **Access Denied Errors**: Verify the user is authenticated and trying to access their own data
- **Google Sign-In Not Working**: Confirm your Google OAuth credentials are correctly configured

## Technical Notes

- User IDs are automatically attached to database operations using `supabase.auth.getUser()`
- We use Supabase's built-in `auth.uid()` function in RLS policies
- Local storage is used by Supabase to persist authentication state between sessions 