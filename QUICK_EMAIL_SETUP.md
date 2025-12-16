# Quick Email Setup Guide

## The Error You're Seeing

"Failed to send verification email. Please check your email configuration."

This means you need to add email credentials to your `.env.local` file.

## Quick Setup (Gmail - Easiest)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Pixo App"
4. Click "Generate"
5. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### Step 3: Update .env.local

Open `.env.local` and add these lines at the end:

```env
# Email Configuration (for OTP verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important:** 
- Replace `your-actual-email@gmail.com` with your Gmail address
- Replace `your-16-character-app-password` with the app password from Step 2
- Remove spaces from the app password (e.g., `abcdefghijklmnop`)

### Step 4: Restart Server

After adding the credentials:
1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 5: Test

1. Go to `/signup`
2. Enter your email
3. Click "Verify Email"
4. Check your inbox for the OTP code

## Example .env.local

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://Pixo:Pixo_2025@pixo-cluster.8yzvx7e.mongodb.net/pixo?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=RsxXycIH3O8AKWDBCWYcfHFPsX1IJkSkfYsCmNlxP90=

# NextAuth
NEXTAUTH_SECRET=RsxXycIH3O8AKWDBCWYcfHFPsX1IJkSkfYsCmNlxP90=
NEXTAUTH_URL=http://localhost:3000

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=sibikarthi7@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

## Troubleshooting

- **"Invalid login"**: Make sure you're using an App Password, not your regular Gmail password
- **"Connection timeout"**: Check your internet connection
- **Still not working**: Check server console for detailed error messages





