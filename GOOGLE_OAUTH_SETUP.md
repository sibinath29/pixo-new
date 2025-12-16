# Google OAuth Setup Guide

Follow these steps to enable Google Sign-In on your Pixo website:

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Copy your Client ID and Client Secret

## Step 2: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project
2. Add the following variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000
```

3. Generate a NextAuth secret:
   - Run: `openssl rand -base64 32` in your terminal
   - Or use any random string generator

## Step 3: Restart Your Development Server

After adding the environment variables, restart your Next.js server:

```bash
npm run dev
```

## Step 4: Test Google Sign-In

1. Go to `/login` page
2. Click "Sign in with Google"
3. You should be redirected to Google's sign-in page
4. After signing in, you'll be redirected back to your site

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` to your production domain
2. Add your production callback URL to Google Cloud Console
3. Make sure your `.env.local` file is not committed to git (it's already in .gitignore)

## Troubleshooting

- **"Invalid client" error**: Check that your Client ID and Secret are correct
- **Redirect URI mismatch**: Make sure the callback URL in Google Console matches exactly
- **CORS errors**: Ensure `NEXTAUTH_URL` matches your actual domain





