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

4. **Jitsi Meet Integration**

   - Free, open-source video conferencing
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
- **Video:** Jitsi Meet (Free & Unlimited)
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
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment (Vercel)

1. **Create a MongoDB Atlas Cluster** and get your connection string.
2. **Push your code to GitHub**.
3. **Import the project to Vercel**.
4. **Configure Environment Variables** in the Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_API_URL` (e.g., `https://your-app-name.vercel.app/api`)
5. **Deploy!**

## 📁 Project Structure

```
skill-setu/
├── lib/
│   ├── ai.ts              # AI analysis functions
│   ├── auth.ts            # JWT authentication
│   ├── daily.ts           # Jitsi/Daily shim
│   ├── db.ts              # MongoDB connection
│   ├── middleware.ts      # API middleware
│   └── utils.ts           # Utility functions
├── models/
│   ├── User.ts            # User schema
│   ├── Session.ts         # Session schema
│   ├── Course.ts          # Course schema
│   ├── Exam.ts            # Exam schema
│   └── Match.ts           # Match schema
├── pages/
│   ├── api/               # API routes
│   ├── dashboard.tsx      # Dashboard
│   ├── profile.tsx        # User profile
│   ├── match.tsx          # Skill matching
│   └── notifications.tsx  # Notification center
├── components/            # UI Components
├── contexts/              # React Contexts
└── styles/                # Global styles
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Content moderation with AI
- Input validation and sanitization
- Secure headers and environment-based secrets
- Fraud detection and token freezing

## 📄 License

This project is created for hackathon purposes.
