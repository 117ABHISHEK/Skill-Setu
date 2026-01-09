# Seed Data Guide

This guide explains how to populate your Skill-Setu database with test data for development and testing.

## 🚀 Quick Start

### 1. Ensure MongoDB is Running

Make sure your MongoDB instance is running and accessible:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 2. Set Environment Variables

Make sure your `.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/skill-setu
# ... other variables
```

### 3. Install Dependencies (if needed)

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Run Seed Script

**Option 1: Using the API (Recommended)**
Open a new terminal and run:
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/dev/seed" -Method POST

# Or use curl (if installed)
curl -X POST http://localhost:3000/api/dev/seed
```

**Option 2: Using Browser**
1. Open your browser
2. Navigate to: `http://localhost:3000/api/dev/seed`
3. Use a REST client (Postman, Insomnia) to make a POST request

**Option 3: Create a simple HTML page** (see below)

## 📊 What Gets Created

The seed script creates:

### 👥 Users (4 test users)
- **Alice Johnson** (`alice@example.com`) - JavaScript & React expert, Guitar player
- **Bob Smith** (`bob@example.com`) - Python expert, Cooking enthusiast  
- **Charlie Brown** (`charlie@example.com`) - Piano expert, Language teacher
- **Diana Prince** (`diana@example.com`) - React & TypeScript expert, Photography lover

**All users have password: `password123`**

### 📚 Courses (3 courses)
- Complete React Masterclass (by Alice)
- Python for Beginners (by Bob)
- Learn Piano in 30 Days (by Charlie)

### 🔗 Matches (3 matches)
- Alice teaches JavaScript to Charlie
- Bob teaches Cooking to Diana
- Charlie teaches Piano to Alice

## 🧪 Testing Workflow

### 1. Login as a User
```
Email: alice@example.com
Password: password123
```

### 2. Find Matches
- Go to `/match` page
- Search for skills you want to learn
- See matched users

### 3. Create a Session
- Accept a match
- Create a live session
- Both users join video call

### 4. Monitor with AI
- AI monitors every 5 minutes
- See real-time feedback on lecture quality
- Get recommendations for improvement

## 🔄 Resetting Data

To clear and reseed:
```bash
npm run seed
```

The script automatically clears existing data before seeding.

## 🎯 Test Scenarios

### Scenario 1: Good Teaching Session
1. Teacher explains concepts clearly
2. Learner asks questions
3. Two-way interaction
4. **Expected**: High scores, "excellent" or "good" quality rating

### Scenario 2: One-Way Lecture
1. Only teacher speaks
2. No learner questions
3. Minimal interaction
4. **Expected**: Lower participation score, "fair" quality rating

### Scenario 3: No Interaction
1. Both silent for extended time
2. Camera off
3. No engagement
4. **Expected**: Fraud flagged, session under review

## 📝 Customizing Seed Data

Edit `scripts/seedData.ts` to:
- Add more users
- Create different skill combinations
- Add more courses
- Create more matches

## ⚠️ Important Notes

- Seed script deletes ALL existing data (users, courses, matches, sessions)
- Use only in development/testing environments
- Never run in production!
- All passwords are hashed with bcrypt
- Tokens and reputation are pre-set for testing
