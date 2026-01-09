# Skill-Setu - AI-Powered Skill Learning Platform

Skill-Setu is a unified platform where every user can both learn and teach skills. It features AI-powered session monitoring, course creation, live video sessions, and personalized learning tracking.

## 🚀 Features

### Core Modules

1. **Unified User Profile**
   - Single profile for both learning and teaching
   - Skill passport with proficiency levels
   - Token and reputation system

2. **Authentication & Security**
   - JWT authentication with refresh tokens
   - Password hashing with bcrypt
   - Rate limiting and account lockout
   - Input validation and sanitization

3. **Skill Matching**
   - AI-powered matching algorithm
   - Match users based on skill needs and offerings
   - Proficiency gap analysis

4. **Live Video Sessions**
   - Daily.co integration for video calls
   - 1-to-1 sessions between matched users
   - Real-time session monitoring

5. **AI Session Monitoring**
   - 5-minute interval analysis
   - Engagement, teaching, and participation scores
   - Fraud detection and prevention
   - Automatic token freezing on suspicious activity

6. **Course Creation & Management**
   - Create courses with modules and lessons
   - Support for video, text, PDF, and external links
   - Course enrollment system

7. **Query & Discussion System**
   - Learners can ask questions
   - Creators can answer and pin important queries
   - Upvoting system for popular questions

8. **Exams & Certifications**
   - Create exams with MCQ and short answer questions
   - Time-limited and randomized exams
   - Automatic certificate generation
   - Verifiable certificates

9. **Personalized Learning Tracker**
   - AI-powered progress analysis
   - Personalized recommendations
   - Skill improvement tracking
   - Badges and XP system

10. **Token & Reputation System**
    - Teaching earns tokens
    - Learning spends tokens
    - Course creation earns tokens
    - Reputation points for successful sessions

## 🛠 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcrypt
- **AI:** OpenAI API (GPT-4, GPT-3.5)
- **Video:** Daily.co
- **UI:** Tailwind CSS with custom gradients

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skill-setu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skill-setu
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   OPENAI_API_KEY=your-openai-api-key
   DAILY_API_KEY=your-daily-co-api-key
   NODE_ENV=development
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
skill-setu/
├── lib/
│   ├── ai.ts              # AI analysis functions
│   ├── auth.ts            # JWT authentication
│   ├── constants.ts       # App constants
│   ├── daily.ts           # Daily.co integration
│   ├── db.ts              # MongoDB connection
│   ├── middleware.ts      # API middleware
│   ├── tokens.ts          # Token utilities
│   └── utils.ts           # Utility functions
├── models/
│   ├── User.ts            # User schema
│   ├── Session.ts         # Session schema
│   ├── Course.ts          # Course schema
│   ├── Exam.ts            # Exam schema
│   ├── Certificate.ts     # Certificate schema
│   └── Match.ts           # Match schema
├── pages/
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User endpoints
│   │   ├── skills/        # Skill matching endpoints
│   │   ├── sessions/      # Session endpoints
│   │   ├── courses/       # Course endpoints
│   │   ├── exams/         # Exam endpoints
│   │   └── learning/      # Learning tracker endpoints
│   ├── _app.tsx           # App wrapper
│   ├── index.tsx          # Home page
│   ├── login.tsx          # Login page
│   ├── signup.tsx         # Signup page
│   ├── dashboard.tsx      # Dashboard
│   ├── profile.tsx        # User profile
│   ├── match.tsx          # Skill matching
│   └── ...                # Other pages
├── styles/
│   └── globals.css        # Global styles
└── ...config files
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- Content moderation with AI
- Input validation and sanitization
- Secure headers and environment-based secrets
- One-time expiring video room URLs
- Fraud detection and token freezing

## 🎯 Usage Examples

### Creating a Course
1. Navigate to "Create Course"
2. Fill in course details
3. Add modules and lessons
4. Publish the course

### Finding a Match
1. Go to "Find Matches"
2. Enter the skill you want to learn
3. Browse matched teachers
4. Create a session

### Starting a Session
1. Accept a match
2. Create a session
3. Start the session when ready
4. AI monitors every 5 minutes
5. End session when done
6. Tokens are transferred automatically

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Skills
- `GET /api/skills/match` - Get pending matches
- `POST /api/skills/match` - Find matches

### Sessions
- `POST /api/sessions/create` - Create session
- `POST /api/sessions/start` - Start session
- `POST /api/sessions/monitor` - Send monitoring snapshot
- `POST /api/sessions/end` - End session

### Courses
- `POST /api/courses/create` - Create course
- `GET /api/courses/[id]` - Get course
- `PUT /api/courses/[id]` - Update course
- `POST /api/courses/[id]/enroll` - Enroll in course
- `GET /api/courses/[id]/queries` - Get queries
- `POST /api/courses/[id]/queries` - Ask question

### Exams
- `POST /api/courses/create-exam` - Create exam
- `GET /api/exams/[id]` - Get exam
- `POST /api/exams/[id]` - Submit exam

### Learning
- `GET /api/learning/tracker` - Get learning tracker

## 🚧 Future Enhancements

- Real-time notifications
- Mobile app
- Advanced AI features
- Social features
- Payment integration
- Multi-language support

## 📄 License

This project is created for hackathon purposes.

## 👥 Contributors

Built with ❤️ for the hackathon.
