# Live Video Session Implementation Guide

## Overview

The live video session feature is fully implemented using Daily.co for video conferencing, integrated with AI monitoring, security features, and token management.

## Architecture

### Database Schema (Session Model)

The Session model includes:
- `sessionId`: Unique identifier
- `dailyRoomUrl` & `dailyRoomName`: Daily.co room details
- `teacher` & `learner`: User references
- `participants`: Array of participant IDs
- `status`: `created | scheduled | live | under_review | completed | cancelled`
- `readyStatus`: Object with `teacher` and `learner` boolean flags
- `aiWindows`: Array of AI monitoring results (every 5 minutes)
- `tokenStatus`: `pending | frozen | distributed`
- `fraud_flagged`: Boolean for fraud detection

### API Endpoints

#### 1. Create Session
**POST** `/api/session/create`

Creates a new session with Daily.co room.

**Request Body:**
```json
{
  "matchId": "match_id",
  "skill": "JavaScript",
  "category": "Tech"
}
```

**Response:**
```json
{
  "session": {
    "sessionId": "session-uuid",
    "dailyRoomUrl": "https://daily.co/room-name",
    "status": "created",
    "readyStatus": { "teacher": false, "learner": false }
  }
}
```

#### 2. Get/Update Session
**GET/PUT** `/api/session/[sessionId]`

- **GET**: Retrieves session details
- **PUT**: Updates session (mark ready, add AI window, update status)

**PUT Request Body:**
```json
{
  "action": "markReady"
}
// OR
{
  "aiWindow": {
    "engagement_score": 85,
    "teaching_score": 90,
    "participation_score": 80,
    "fraud_detected": false,
    "notes": "..."
  }
}
```

#### 3. Monitor Session
**POST** `/api/session/[sessionId]/monitor`

Sends monitoring snapshot for AI analysis (called every 5 minutes).

**Request Body:**
```json
{
  "snapshot": {
    "transcript": "Teaching session transcript with two-way communication...",
    "speakerActivity": {
      "participant1": {
        "speaking": true,
        "cameraOn": true,
        "silenceDuration": 0
      },
      "participant2": {
        "speaking": false,
        "cameraOn": true,
        "silenceDuration": 30
      }
    },
    "interactionMetrics": {
      "teacherSpeakingTime": 60,
      "learnerSpeakingTime": 40,
      "questionCount": 3,
      "hasTwoWayInteraction": true
    }
  }
}
```

**Note**: The system now tracks two-way communication patterns:
- Teacher explaining concepts
- Learner asking questions
- Turn-taking and interactive dialogue
- Evidence of concept understanding

**Response:**
```json
{
  "analysis": {
    "engagement_score": 85,
    "teaching_score": 90,
    "participation_score": 80,
    "fraud_detected": false,
    "notes": "Good engagement..."
  },
  "sessionStatus": "live",
  "tokenStatus": "pending"
}
```

#### 4. End Session
**POST** `/api/session/[sessionId]/end`

Ends the session, calculates final scores, transfers tokens.

**Response:**
```json
{
  "session": {
    "status": "completed",
    "duration": 45,
    "final_engagement_score": 85,
    "tokens_transferred": true,
    "tokenStatus": "distributed"
  }
}
```

## Frontend Implementation

### LiveSession Component (`/pages/session/[sessionId].tsx`)

#### Key Features:

1. **Ready Confirmation Flow**
   - Both users must click "I'm Ready"
   - Session moves to `live` status when both are ready
   - Video call can only start after both confirm

2. **Daily.co Integration**
   - Uses `@daily-co/daily-js` SDK
   - Creates iframe for video display
   - Handles join/leave events
   - Automatic cleanup on component unmount

3. **AI Monitoring (5-minute intervals)**
   - Automatic snapshot collection every 5 minutes
   - Sends data to `/api/session/[sessionId]/monitor`
   - Updates AI status badge based on results
   - Shows fraud warnings if detected

4. **Session Timer**
   - Displays elapsed time once session starts
   - Updates every second
   - Shows format: `MM:SS`

5. **Status Badges**
   - 🟢 Session Valid: Normal operation
   - 🟡 Under Review: Token frozen, needs review
   - 🔴 Fraud Detected: Suspicious activity detected

6. **Session End**
   - Clean shutdown of Daily.co call
   - Redirects to dashboard after completion
   - Shows final session summary

## Security Features

### Fraud Detection Rules

Auto-flag if:
1. **Silence > 2 minutes**: Either participant silent for > 120 seconds
2. **No interaction**: Both participants not speaking and no transcript
3. **Camera off entire window**: Both cameras off for entire monitoring window
4. **AI-detected fraud**: OpenAI analysis flags suspicious activity

### Token Management

- **Pending**: Initial state, tokens not transferred
- **Frozen**: Fraud detected, tokens held until review
- **Distributed**: Session valid, tokens transferred to teacher

### Session Lifecycle

1. **Created**: Session created, waiting for readiness
2. **Live**: Both ready, video call active
3. **Under Review**: Fraud detected or flagged
4. **Completed**: Session ended successfully
5. **Cancelled**: Session cancelled before completion

## Daily.co Room Configuration

- **Private rooms**: Only invited users can join
- **Expiration**: 2 hours after creation
- **Max participants**: 2 (teacher + learner)
- **Features**: Video, audio, screen share, chat
- **Recording**: Disabled (no video storage)
- **Auto-cleanup**: Room deleted when session ends

## AI Monitoring Details

### Monitoring Window Structure

Each window (every 5 minutes) includes:
- `windowIndex`: Sequential number
- `timestamp`: When monitoring occurred
- `transcript`: Conversation snippet (if available)
- `speakerActivity`: Speaking status, camera status, silence duration
- `engagement_score`: 0-100, learner engagement
- `teaching_score`: 0-100, teaching effectiveness
- `participation_score`: 0-100, overall participation
- `fraud_detected`: Boolean flag
- `notes`: AI-generated notes
- `aiAnalysis`: Full AI response object

### AI Analysis

Uses OpenAI GPT-4 to analyze:
- Participant engagement
- Teaching quality
- Conversation relevance
- Suspicious patterns
- Overall session health

## Usage Flow

1. **User finds match** → Clicks "Create Session"
2. **Session created** → Redirected to `/session/[sessionId]`
3. **Ready confirmation** → Both users click "I'm Ready"
4. **Video call starts** → Daily.co iframe loads
5. **Monitoring begins** → AI checks every 5 minutes
6. **Status updates** → Badge reflects current state
7. **Session ends** → User clicks "End Session"
8. **Tokens distributed** → If valid, tokens transferred
9. **Redirect** → Back to dashboard

## Error Handling

- **Session not found**: Redirects to dashboard
- **Not authorized**: 403 error, access denied
- **Daily.co errors**: Shows error message, allows retry
- **Network errors**: Retry logic for monitoring snapshots
- **Fraud detected**: Freezes tokens, flags for review

## Testing Checklist

- [ ] Session creation works
- [ ] Ready confirmation flow
- [ ] Daily.co video call joins successfully
- [ ] AI monitoring runs every 5 minutes
- [ ] Fraud detection triggers correctly
- [ ] Token transfer on successful completion
- [ ] Session cleanup on end
- [ ] Error handling for edge cases
- [ ] UI updates reflect backend state
- [ ] Timer displays correctly

## Environment Variables Required

```env
DAILY_API_KEY=your-daily-co-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Dependencies

- `@daily-co/daily-js`: ^0.52.0 (Daily.co SDK)
- `openai`: ^4.20.1 (AI analysis)
- `axios`: For API calls
- `react-hot-toast`: For notifications

## Future Enhancements

1. Real-time transcript integration
2. Screen sharing indicator
3. Recording permission (optional)
4. Multi-session support
5. Session replay (audio only)
6. Advanced fraud detection ML models
7. Participant ratings after session
8. Session notes and feedback
