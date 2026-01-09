import OpenAI from 'openai';
import { IMonitoringSnapshot } from '@/models/Session';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysisResult {
  engagement_score: number;
  teaching_score: number;
  participation_score: number;
  fraud_detected: boolean;
  notes: string;
  recommendations?: string[];
  lecture_quality?: 'excellent' | 'good' | 'fair' | 'poor';
  key_strengths?: string[];
  improvement_areas?: string[];
}

export async function analyzeSessionSnapshot(
  snapshot: IMonitoringSnapshot,
  skill: string,
  skillCategory: string
): Promise<AIAnalysisResult> {
  const prompt = `You are an AI monitoring system for a live TWO-WAY learning session. Analyze the session data focusing on interactive teaching and learning.

Session Context:
- Skill: ${skill}
- Category: ${skillCategory}
- Transcript snippet: ${snapshot.transcript || 'No transcript available'}
- Teacher activity: ${JSON.stringify(snapshot.speakerActivity.teacher)}
- Learner activity: ${JSON.stringify(snapshot.speakerActivity.learner)}

IMPORTANT: This is a TWO-WAY COMMUNICATION session where:
- Teacher explains concepts and helps learner understand
- Learner asks questions and seeks clarification
- Both parties actively participate in the learning process
- Normal teaching includes: explanations, Q&A, clarifications, examples, practice

Analyze and provide:
1. Engagement Score (0-100): How engaged is the learner?
   - Are they asking questions?
   - Are they responding to teacher's explanations?
   - Camera on and paying attention?
   - Active participation in two-way conversation

2. Teaching Score (0-100): How effective is the teacher?
   - Is teacher explaining concepts clearly?
   - Are they responding to learner's questions?
   - Are they checking for understanding?
   - Is there interactive teaching happening (not just one-way talking)?

3. Participation Score (0-100): Quality of TWO-WAY interaction
   - Turn-taking between teacher and learner
   - Evidence of questions being asked and answered
   - Active dialogue and concept discussion
   - Both parties contributing to the conversation

4. Fraud Detection (boolean): ONLY flag if genuinely suspicious:
   - Both parties completely silent for extended periods (no teaching/learning happening)
   - No evidence of any two-way communication at all
   - Camera off for entire duration with no interaction
   - Clearly fake or inappropriate content
   
   DO NOT flag for:
   - Teacher explaining while learner listens (normal teaching)
   - Brief pauses for thinking or note-taking
   - Learner processing information after explanation
   - Natural conversation pauses

5. Notes: Analyze the TWO-WAY interaction and provide detailed feedback. Mention:
   - Evidence of teaching (explanations, examples, guidance)
   - Evidence of learning (questions, clarifications, responses)
   - Interaction patterns and turn-taking
   - Concept understanding indicators
   - What makes this a good/bad lecture
   - Specific strengths and areas for improvement
   - Quality of explanations and learner comprehension

6. Recommendations: Provide actionable advice for improvement (if any)

Return ONLY a valid JSON object with this exact structure:
{
  "engagement_score": <number 0-100>,
  "teaching_score": <number 0-100>,
  "participation_score": <number 0-100>,
  "fraud_detected": <boolean>,
  "notes": "<detailed string analyzing lecture quality, interaction quality, teaching effectiveness, and learner engagement>",
  "recommendations": ["<actionable string>", "<actionable string>", ...],
  "lecture_quality": "<string: 'excellent' | 'good' | 'fair' | 'poor'>",
  "key_strengths": ["<string>", ...],
  "improvement_areas": ["<string>", ...]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI education monitoring system. Provide accurate, fair assessments of learning sessions.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const analysis = JSON.parse(response) as AIAnalysisResult;
    return analysis;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Fallback scores in case of AI failure
    return {
      engagement_score: 50,
      teaching_score: 50,
      participation_score: 50,
      fraud_detected: false,
      notes: 'AI analysis unavailable, using default scores',
      recommendations: [],
    };
  }
}

export async function generatePersonalizedAdvice(
  userId: string,
  userProgress: any,
  completedCourses: any[],
  attendedSessions: any[]
): Promise<string> {
  const prompt = `Generate personalized learning advice for a user based on their activity:

User Progress:
${JSON.stringify(userProgress, null, 2)}

Completed Courses:
${JSON.stringify(completedCourses.map((c) => ({ title: c.title, skill: c.skill })), null, 2)}

Attended Sessions:
${JSON.stringify(attendedSessions.map((s) => ({ skill: s.skill, score: s.final_engagement_score })), null, 2)}

Provide:
1. Current strengths
2. Areas for improvement
3. Next skill suggestions
4. Motivational tips

Keep it concise and encouraging (2-3 sentences per point).`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly AI learning coach. Provide personalized, encouraging advice to help users improve their skills.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Keep learning and improving!';
  } catch (error) {
    console.error('AI Advice Generation Error:', error);
    return 'Continue practicing your skills and explore new learning opportunities!';
  }
}

export async function moderateContent(text: string): Promise<{ safe: boolean; reason?: string }> {
  try {
    const completion = await openai.moderations.create({
      input: text,
    });

    const result = completion.results[0];
    if (result.flagged) {
      const categories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);
      return { safe: false, reason: `Content flagged: ${categories.join(', ')}` };
    }

    return { safe: true };
  } catch (error) {
    console.error('Content Moderation Error:', error);
    // If moderation fails, err on the side of caution
    return { safe: false, reason: 'Content moderation unavailable' };
  }
}
