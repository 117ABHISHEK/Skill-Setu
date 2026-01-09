# Live Session Flow Guide

This guide explains the complete flow for creating matches, starting video sessions, and monitoring with AI.

## 🔄 Complete Session Flow

### Step 1: Find Matches
1. **Login** to your account
2. **Go to `/match`** page
3. **Search for a skill** you want to learn (e.g., "JavaScript", "Piano", "Cooking")
4. **Select a category** (Tech, Music, Cooking, etc.)
5. **Click "Search"** to find available teachers

### Step 2: Create a Match
1. **View match results** - See users who can teach your desired skill
2. **Review match score** - Higher scores = better matches
3. **Click "Request Match"** - Send a match request to the teacher
4. **Match appears in "Pending Matches"** section

### Step 3: Accept Match & Create Session
1. **Teacher accepts** the match request
2. **Click "Create Session"** on the accepted match
3. **System creates:**
   - Daily.co video room (private, 2-hour expiry)
   - Session record in database
   - Both users get session access

### Step 4: Join Video Session
1. **Both users click "I'm Ready"** button
2. **Once both are ready**, click **"Start Video Session"** or **"Join Video Call"**
3. **Daily.co video room opens** - Both users join automatically
4. **Session status changes to "live"**

### Step 5: AI Monitoring (Automatic)
During the live session:

1. **Every 5 minutes**, AI automatically:
   - Collects session data (transcript, speaker activity, camera status)
   - Analyzes two-way communication patterns
   - Scores engagement, teaching quality, and participation
   - Provides real-time feedback

2. **AI Analysis includes:**
   - **Engagement Score** (0-100): How engaged is the learner?
   - **Teaching Score** (0-100): How effective is the teacher?
   - **Participation Score** (0-100): Quality of two-way interaction
   - **Lecture Quality**: Excellent / Good / Fair / Poor
   - **Key Strengths**: What's working well
   - **Improvement Areas**: What could be better
   - **Recommendations**: Actionable advice

3. **Real-time Feedback:**
   - Toast notifications show quality updates
   - AI Feedback component displays detailed analysis
   - Status badge shows session validity

### Step 6: End Session
1. **Click "End Session"** button
2. **System:**
   - Closes Daily.co video room
   - Generates final AI summary
   - Calculates average scores
   - Updates token status (distributed or frozen)
   - Updates learning tracker

## 🎯 Good Lecture Indicators

AI considers these factors for a "good lecture":

### ✅ Excellent Lecture (80+ scores)
- Teacher explains concepts clearly and concisely
- Learner asks thoughtful questions
- Active two-way conversation
- Both parties engaged
- Concepts are well-understood
- Examples and clarifications provided

### ✅ Good Lecture (60-79 scores)
- Teacher explains topics effectively
- Some learner questions/interactions
- Basic two-way communication
- Both parties present and attentive

### ⚠️ Fair Lecture (40-59 scores)
- One-way teaching (mostly teacher speaking)
- Limited learner engagement
- Few questions or clarifications
- Minimal interaction

### ❌ Poor Lecture (<40 scores)
- Very limited interaction
- No questions from learner
- One-way communication only
- Low engagement

## 🤖 AI Monitoring Features

### What AI Tracks:
1. **Speaking Patterns**
   - Teacher speaking time
   - Learner speaking time
   - Turn-taking patterns

2. **Interaction Quality**
   - Questions asked
   - Answers provided
   - Concept explanations
   - Understanding checks

3. **Engagement Signals**
   - Camera status
   - Active participation
   - Response patterns
   - Silence duration (context-aware)

### Fraud Detection:
AI flags sessions as suspicious if:
- Both parties completely silent for >3 minutes (no teaching/learning)
- Both cameras off with no interaction
- No evidence of any communication
- Clearly fake/inappropriate content

**AI does NOT flag for:**
- Normal teaching pauses
- Teacher explaining while learner listens
- Brief thinking/processing time
- Natural conversation breaks

## 📊 Reading AI Feedback

### Scores:
- **Green (80-100)**: Excellent
- **Blue (60-79)**: Good
- **Yellow (40-59)**: Fair
- **Red (0-39)**: Needs Improvement

### Feedback Sections:
1. **Key Strengths**: What's working well
2. **Improvement Areas**: What to focus on
3. **Notes**: Detailed analysis
4. **Recommendations**: Actionable tips

## 🧪 Testing with Seed Data

1. **Run seed script**: `npm run seed`
2. **Login as Alice**: `alice@example.com` / `password123`
3. **Go to Match page**: Search for "Piano"
4. **Create match** with Charlie (who teaches Piano)
5. **Create session** from the match
6. **Join video call** (simulate with 2 browser windows)
7. **Watch AI monitor** in real-time

## 💡 Tips for Good Sessions

1. **Teacher:**
   - Explain concepts clearly
   - Ask if learner understands
   - Provide examples
   - Encourage questions

2. **Learner:**
   - Ask questions when confused
   - Respond to teacher's explanations
   - Show engagement (camera on, active listening)
   - Seek clarifications

3. **Both:**
   - Maintain two-way conversation
   - Take turns speaking
   - Stay engaged throughout
   - Use video/audio actively

## 🔧 Troubleshooting

### Session won't start?
- Check both users clicked "I'm Ready"
- Verify Daily.co API key is set
- Check browser permissions for camera/mic

### AI not monitoring?
- Ensure session status is "live"
- Check OpenAI API key is configured
- Verify monitoring runs every 5 minutes
- Check browser console for errors

### No feedback showing?
- Wait for first 5-minute window
- Check AI Feedback component is rendered
- Verify API response includes analysis data
