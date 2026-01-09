# Environment Variables Setup

Copy the following into a `.env` file in your project root:

```env
# ============================================
# Skill-Setu Environment Variables
# ============================================

# ============================================
# DATABASE CONFIGURATION
# ============================================
# MongoDB connection string
# Local: mongodb://localhost:27017/skill-setu
# MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/skill-setu
MONGODB_URI=mongodb://localhost:27017/skill-setu

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
# JWT Secret Key - MUST be a long, random, secure string
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters

# JWT Refresh Token Secret - MUST be different from JWT_SECRET
# Generate with: openssl rand -base64 32
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-characters

# ============================================
# AI INTEGRATION (OpenAI)
# ============================================
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# ============================================
# VIDEO CONFERENCING (Daily.co)
# ============================================
# Get your API key from: https://dashboard.daily.co/
DAILY_API_KEY=your-daily-co-api-key-here

# Daily.co domain (optional, usually auto-detected)
# DAILY_DOMAIN=your-company.daily.co

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Environment: development | production
NODE_ENV=development

# API Base URL (for frontend API calls)
# Development: http://localhost:3000/api
# Production: https://yourdomain.com/api
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Application Base URL
# Development: http://localhost:3000
# Production: https://yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# OPTIONAL: RATE LIMITING
# ============================================
# Maximum requests per window (default: 100)
# RATE_LIMIT_MAX=100

# Rate limit window in milliseconds (default: 15 minutes)
# RATE_LIMIT_WINDOW_MS=900000

# ============================================
# OPTIONAL: LOGGING
# ============================================
# Enable detailed logging (true/false)
# DEBUG=false

# ============================================
# OPTIONAL: SESSION CONFIGURATION
# ============================================
# Session monitoring interval in minutes (default: 5)
# SESSION_MONITORING_INTERVAL=5

# Maximum session duration in minutes (default: 120)
# MAX_SESSION_DURATION=120

# ============================================
# OPTIONAL: TOKEN CONFIGURATION
# ============================================
# Starting tokens for new users (default: 100)
# STARTING_TOKENS=100

# Tokens per teaching session (default: 10)
# TOKENS_PER_SESSION=10
```

## Required Variables (Minimum Setup)

For basic functionality, you only need these:

```env
MONGODB_URI=mongodb://localhost:27017/skill-setu
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
OPENAI_API_KEY=sk-your-openai-api-key-here
DAILY_API_KEY=your-daily-co-api-key-here
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Generate Secure Secrets

### Option 1: Using OpenSSL
```bash
openssl rand -base64 32
```

### Option 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Using PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Setup Steps

1. **Create `.env` file** in project root:
   ```bash
   cp ENV_SETUP.md .env
   # Then edit .env with your actual values
   ```

2. **Fill in your values**:
   - MongoDB URI (local or Atlas)
   - Generate JWT secrets
   - Add OpenAI API key
   - Add Daily.co API key

3. **Verify setup**:
   ```bash
   npm run dev
   ```

## Production Security Checklist

- [ ] Generate strong random secrets (min 32 characters)
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Update NEXT_PUBLIC_API_URL to production URL
- [ ] Update NEXT_PUBLIC_APP_URL to production URL
- [ ] Never commit .env to Git (already in .gitignore)
- [ ] Use environment variables in hosting platform

## Where to Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Daily.co**: https://dashboard.daily.co/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
