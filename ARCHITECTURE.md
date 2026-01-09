# Skill-Setu Architecture Documentation

## System Overview

Skill-Setu is a full-stack AI-powered skill learning and teaching platform built with Next.js, MongoDB, and OpenAI. The platform features a unified user model where every user can both learn and teach skills.

## Technology Stack

### Frontend
- **Next.js 14** - React framework with SSR and API routes
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - User notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### External Services
- **OpenAI API** - AI-powered analysis and recommendations
- **Daily.co** - Live video sessions

## Database Schema

### User Model
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  bio?: string
  skills_known: ISkill[]
  skills_learning: ISkill[]
  courses_created: ObjectId[]
  progress_tracker: IProgressTracker[]
  tokens: number
  reputation: number
  refreshTokens: string[]
  loginAttempts: number
  lockUntil?: Date
}
```

### Session Model
```typescript
{
  sessionId: string (unique)
  dailyRoomUrl: string
  teacher: ObjectId (ref: User)
  learner: ObjectId (ref: User)
  skill: string
  skillCategory: string
  status: 'scheduled' | 'active' | 'ended' | 'cancelled' | 'under_review'
  startTime?: Date
  endTime?: Date
  duration?: number
  monitoring_snapshots: IMonitoringSnapshot[]
  final_engagement_score?: number
  final_teaching_score?: number
  final_participation_score?: number
  fraud_flagged: boolean
  tokens_transferred: boolean
}
```

### Course Model
```typescript
{
  title: string
  description: string
  skill: string
  skillCategory: string
  creator: ObjectId (ref: User)
  modules: IModule[]
  enrolledUsers: ObjectId[]
  price: number
  hasExam: boolean
  exam?: ObjectId (ref: Exam)
  queries: IQuery[]
  status: 'draft' | 'published' | 'archived'
}
```

### Exam Model
```typescript
{
  course: ObjectId (ref: Course)
  title: string
  questions: IQuestion[]
  passingScore: number
  timeLimit: number
  maxAttempts: number
  attempts: IExamAttempt[]
  randomized: boolean
}
```

### Certificate Model
```typescript
{
  certificateId: string (unique)
  user: ObjectId (ref: User)
  course: ObjectId (ref: Course)
  exam?: ObjectId (ref: Exam)
  skill: string
  skillCategory: string
  issuedAt: Date
  issuedBy: ObjectId (ref: User)
  verified: boolean
  metadata: {
    issueDate: Date
    verificationUrl: string
  }
}
```

### Match Model
```typescript
{
  learner: ObjectId (ref: User)
  teacher: ObjectId (ref: User)
  skill: string
  skillCategory: string
  matchScore: number
  reason: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expiresAt: Date
}
```

## Core Modules

### 1. Authentication Module

**Endpoints:**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

**Features:**
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt (10 salt rounds)
- Rate limiting (5 attempts per 15 minutes)
- Account lockout after 5 failed attempts (30 minutes)
- Password strength validation (minimum 8 characters)

### 2. User Profile Module

**Endpoints:**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

**Features:**
- Unified profile for learning and teaching
- Skill passport with proficiency levels
- Progress tracking per skill
- Badges and XP system

### 3. Skill Matching Module

**Endpoints:**
- `GET /api/skills/match` - Get pending matches
- `POST /api/skills/match` - Find skill matches

**Algorithm:**
- Skill name matching (50 points)
- Proficiency gap analysis (30 points)
- Reputation score (20 points)
- Minimum match score: 40

### 4. Live Video Session Module

**Endpoints:**
- `POST /api/sessions/create` - Create new session
- `POST /api/sessions/start` - Start active session
- `POST /api/sessions/monitor` - Submit monitoring snapshot
- `POST /api/sessions/end` - End session and transfer tokens

**Flow:**
1. User accepts match
2. Session created with Daily.co room
3. Both users join room
4. Session started when ready
5. AI monitoring every 5 minutes
6. Session ended
7. Tokens transferred automatically

### 5. AI Session Monitoring

**Implementation:**
- Every 5 minutes, frontend sends snapshot to `/api/sessions/monitor`
- Snapshot includes:
  - Transcript snippet
  - Speaker activity (camera on/off, speaking)
  - Timestamp
- AI analyzes and returns:
  - Engagement score (0-100)
  - Teaching score (0-100)
  - Participation score (0-100)
  - Fraud detection (boolean)
  - Notes and recommendations

**Fraud Detection:**
- Prolonged silence
- Camera abuse
- No actual teaching
- Inappropriate content
- If fraud detected: session frozen, tokens not transferred, human review required

### 6. Course Creation Module

**Endpoints:**
- `POST /api/courses/create` - Create new course
- `GET /api/courses` - List courses
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course
- `POST /api/courses/[id]/enroll` - Enroll in course

**Features:**
- Module-based structure
- Support for video, text, PDF, and external links
- Course pricing in tokens
- Content moderation with AI

### 7. Query & Discussion System

**Endpoints:**
- `GET /api/courses/[id]/queries` - Get all queries
- `POST /api/courses/[id]/queries` - Ask question
- `PUT /api/courses/[id]/queries/[queryId]` - Answer/pin query
- `POST /api/courses/[id]/queries/[queryId]` - Upvote query

**Features:**
- Learners can ask questions
- Creators can answer and pin
- Upvoting system
- Pinned questions appear first
- Content moderation

### 8. Exams & Certification Module

**Endpoints:**
- `POST /api/courses/create-exam` - Create exam for course
- `GET /api/exams/[id]` - Get exam (randomized)
- `POST /api/exams/[id]` - Submit exam answers

**Features:**
- MCQ and short answer questions
- Time-limited exams
- Randomized question order
- Limited attempts (default: 3)
- Automatic grading
- Certificate generation on passing

### 9. Personalized Learning Tracker

**Endpoints:**
- `GET /api/learning/tracker` - Get user's learning analytics

**Features:**
- AI-powered progress analysis
- Personalized recommendations
- Skill improvement tracking
- Weekly insights
- Motivation nudges

### 10. Token & Reputation System

**Token Flow:**
- Starting tokens: 100
- Teaching session: +10 tokens
- Learning session: -10 tokens
- Course creation: +50 tokens (configurable)
- Course enrollment: cost varies

**Reputation Flow:**
- Successful teaching session: +1 reputation
- Course completion: +5 reputation
- Certificate earned: +10 reputation

## Security Features

### Authentication Security
- JWT with 15-minute access tokens
- 7-day refresh tokens
- Token rotation on refresh
- Secure password storage (bcrypt)

### API Security
- Rate limiting on all endpoints
- Input validation and sanitization
- Content moderation with OpenAI
- CORS protection
- Environment-based secrets

### Session Security
- One-time expiring video room URLs (1 hour)
- Only matched users can join
- Session validation before start
- Fraud detection and token freezing

### Data Security
- No full video storage
- Minimal session metadata only
- User data export capability
- Secure headers

## AI Integration

### OpenAI Models Used
- **GPT-4** - Session monitoring and analysis
- **GPT-3.5-turbo** - Personalized advice generation
- **Moderation API** - Content safety checks

### AI Analysis Flow
1. Frontend collects session data (transcript, activity)
2. Data sent to `/api/sessions/monitor`
3. AI analyzes with structured prompt
4. Returns JSON with scores and fraud detection
5. Backend stores analysis and updates session status

## Frontend Architecture

### Pages Structure
- `/` - Home (redirects to login/dashboard)
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Main dashboard
- `/profile` - User profile and skill passport
- `/match` - Skill matching interface
- `/courses` - Course listing
- `/create-course` - Course creation
- `/tracker` - Learning tracker

### Components
- Reusable UI components with Tailwind CSS
- Gradient-based modern design
- Responsive layout
- Toast notifications for user feedback

## Deployment Considerations

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `OPENAI_API_KEY` - OpenAI API key
- `DAILY_API_KEY` - Daily.co API key
- `NODE_ENV` - Environment (development/production)

### Database Indexing
- User email (unique)
- Session sessionId (unique)
- Course creator, skill, status
- Match learner, teacher, status
- Certificate certificateId (unique)

### Performance Optimizations
- MongoDB connection pooling
- Indexed queries
- Pagination on list endpoints
- Cached refresh tokens

## Future Enhancements

1. **Real-time Features**
   - WebSocket integration for live updates
   - Push notifications
   - Live chat in sessions

2. **Advanced AI**
   - Skill recommendation engine
   - Personalized learning paths
   - Automated quiz generation

3. **Social Features**
   - User reviews and ratings
   - Social sharing
   - Learning communities

4. **Monetization**
   - Payment gateway integration
   - Subscription plans
   - Revenue sharing

5. **Mobile App**
   - React Native mobile app
   - Push notifications
   - Offline mode

## Testing Strategy

### Unit Tests
- Model validation
- Utility functions
- AI analysis functions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow

### E2E Tests
- User registration and login
- Course creation and enrollment
- Session flow
- Exam submission

## Monitoring & Analytics

### Key Metrics
- User engagement
- Session completion rates
- Course enrollment
- Token transactions
- AI analysis accuracy
- Fraud detection rate

### Logging
- Error logging with stack traces
- API request logging
- AI analysis logs
- Session monitoring logs
