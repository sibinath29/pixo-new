# Backend Authentication Setup Guide

This guide will help you set up the backend authentication system for Pixo.

## Prerequisites

1. MongoDB database (local or cloud)
2. Node.js and npm installed

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/pixo`)

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/pixo`

## Step 2: Environment Variables

Create a `.env.local` file in the root of your project:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pixo
# OR for local: MONGODB_URI=mongodb://localhost:27017/pixo

# JWT Secret (generate a random string)
# Run: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth (if using Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth (if using NextAuth)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Step 3: Generate Secrets

### Generate JWT Secret:
```bash
openssl rand -base64 32
```

### Generate NextAuth Secret:
```bash
openssl rand -base64 32
```

## Step 4: API Endpoints

The backend provides the following endpoints:

### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST `/api/auth/login`
Login with email/password
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET `/api/auth/me`
Get current user (requires Authorization header)
```
Authorization: Bearer <token>
```

## Step 5: Test the Backend

1. Start your development server:
```bash
npm run dev
```

2. Test registration:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

3. Test login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Features

✅ User registration with email/password
✅ User login with email/password
✅ Password hashing with bcrypt
✅ JWT token authentication
✅ Protected routes
✅ User session management
✅ Google OAuth integration (optional)
✅ User profile management

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Tokens are stored securely in localStorage
- API routes validate all inputs
- Database connection pooling

## Troubleshooting

### "MongoServerError: Authentication failed"
- Check your MongoDB connection string
- Verify database user credentials
- Ensure IP is whitelisted (for Atlas)

### "JWT_SECRET is not defined"
- Make sure `.env.local` exists
- Restart your dev server after adding environment variables

### "Cannot connect to MongoDB"
- Check if MongoDB is running (for local)
- Verify connection string format
- Check network/firewall settings

## Production Deployment

1. Use environment variables in your hosting platform
2. Use MongoDB Atlas for production database
3. Set secure JWT_SECRET (different from development)
4. Enable HTTPS
5. Set proper CORS settings
6. Use strong passwords for database users












