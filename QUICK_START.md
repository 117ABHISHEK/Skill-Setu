# Quick Start Guide - Skill-Setu

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **OpenAI API Key** (for AI features)
4. **Daily.co API Key** (for video sessions) - Optional for development

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/skill-setu
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
OPENAI_API_KEY=sk-your-openai-api-key
DAILY_API_KEY=your-daily-co-api-key
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Note:** For development, you can use dummy values for `DAILY_API_KEY` if you're not testing video features.

### 3. Start MongoDB

**Local MongoDB:**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services panel
```

**Or use MongoDB Atlas:**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and update `MONGODB_URI`

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## First Steps

### 1. Create an Account

1. Navigate to `http://localhost:3000`
2. Click "Sign up"
3. Fill in:
   - Name
   - Email
   - Password (minimum 8 characters)
   - Optional bio

### 2. Set Up Your Profile

1. Go to "Profile" from dashboard
2. Add skills you can teach:
   - Click "Edit Profile"
   - Add skill name, category, and proficiency level
3. Add skills you're learning:
   - Same process as above

### 3. Find a Match

1. Go to "Find Matches"
2. Enter a skill you want to learn (e.g., "JavaScript")
3. Select category (e.g., "Tech")
4. Click "Search"
5. Browse matched teachers
6. Create a session with a match

### 4. Create a Course

1. Go to "Create Course"
2. Fill in:
   - Course title
   - Description
   - Skill and category
   - Price in tokens
3. Add modules and lessons
4. Click "Create Course"

### 5. View Learning Tracker

1. Go to "Learning Tracker"
2. View your:
   - Course completion stats
   - Session attendance
   - XP and badges
   - AI-powered recommendations

## API Testing

You can test the API endpoints using tools like Postman or curl.

### Example: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

### Example: Get Profile (with token)

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Issues

### MongoDB Connection Error

**Problem:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running
- Check `MONGODB_URI` is correct
- For Atlas, check IP whitelist settings

### OpenAI API Error

**Problem:** `OpenAI API error: Invalid API key`

**Solution:**
- Verify your OpenAI API key in `.env`
- Ensure you have credits in your OpenAI account
- Check API key permissions

### Daily.co Video Not Working

**Problem:** Video sessions not connecting

**Solution:**
- Verify `DAILY_API_KEY` in `.env`
- Check Daily.co dashboard for API limits
- For development, video features can be tested later

### JWT Token Expired

**Problem:** `Invalid or expired token`

**Solution:**
- Tokens expire after 15 minutes
- Refresh token automatically in production
- Re-login if refresh fails

## Development Tips

### Database Reset

To reset the database (WARNING: Deletes all data):

```bash
# Connect to MongoDB
mongosh

# Use database
use skill-setu

# Drop all collections
db.users.drop()
db.sessions.drop()
db.courses.drop()
db.exams.drop()
db.certificates.drop()
db.matches.drop()
```

### View Database Collections

```bash
mongosh skill-setu
> show collections
> db.users.find().pretty()
```

### Debug Mode

Set `NODE_ENV=development` in `.env` for detailed error messages.

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Update `.env` with production values:
- Use strong, random `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Use production MongoDB URI
- Set `NODE_ENV=production`

### Recommended Hosting

- **Vercel** - Best for Next.js apps
- **AWS** - For full control
- **Heroku** - Easy deployment
- **DigitalOcean** - Cost-effective

### MongoDB Hosting

- **MongoDB Atlas** - Recommended for production
- Free tier available for small apps

## Testing Features

### Test Authentication

1. Sign up a new user
2. Login with credentials
3. Access protected routes

### Test Skill Matching

1. Create two users:
   - User A: Teaching "JavaScript"
   - User B: Learning "JavaScript"
2. User B searches for matches
3. Verify match appears

### Test Session Creation

1. User B accepts match
2. Create session
3. Verify Daily.co room created
4. Start session (both users)
5. Send monitoring snapshots
6. End session
7. Verify tokens transferred

### Test Course Creation

1. User creates course
2. Another user enrolls
3. Verify token deduction
4. Post questions
5. Creator answers

### Test Exam & Certificate

1. Creator adds exam to course
2. Learner takes exam
3. Submit answers
4. Verify grading
5. Check certificate generation

## Support

For issues or questions:
1. Check `ARCHITECTURE.md` for detailed documentation
2. Review error logs in console
3. Verify environment variables
4. Check API endpoint responses

## Next Steps

After setup:
1. Explore all features
2. Customize UI/UX
3. Add your own skills
4. Test AI features
5. Deploy to production

Happy coding! 🎓✨
