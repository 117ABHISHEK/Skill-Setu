import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { analyzeSessionSnapshot } from '@/lib/ai';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const { sessionId } = req.query;
      const userId = req.user?.userId;

      const validation = validateInput(req, res, ['snapshot']);
      if (validation) return;

      const { snapshot } = req.body;

      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status !== 'live') {
        return res.status(400).json({ error: 'Session is not live' });
      }

      // Verify user is part of session
      const teacherId = String(session.teacher);
      const learnerId = String(session.learner);
      const currentUserIdStr = String(userId);

      if (
        teacherId !== currentUserIdStr &&
        learnerId !== currentUserIdStr
      ) {
        return res.status(403).json({ error: 'You are not part of this session' });
      }

      // Build enhanced transcript with interaction context
      let enhancedTranscript = snapshot.transcript || '';
      
      // Add interaction metrics context if available
      if (snapshot.interactionMetrics) {
        const metrics = snapshot.interactionMetrics;
        enhancedTranscript += ` [Interaction Metrics: Teacher speaking ${metrics.teacherSpeakingTime || 0}s, ` +
          `Learner speaking ${metrics.learnerSpeakingTime || 0}s, ` +
          `Questions asked: ${metrics.questionCount || 0}, ` +
          `Two-way interaction: ${metrics.hasTwoWayInteraction ? 'Yes' : 'No'}] `;
      }

      // Analyze snapshot with AI (focusing on two-way communication)
      const aiAnalysis = await analyzeSessionSnapshot(
        {
          timestamp: new Date(),
          transcript: enhancedTranscript,
          speakerActivity: {
            teacher: snapshot.speakerActivity?.participant1 || snapshot.speakerActivity?.teacher || {
              speaking: false,
              cameraOn: true,
            },
            learner: snapshot.speakerActivity?.participant2 || snapshot.speakerActivity?.learner || {
              speaking: false,
              cameraOn: true,
            },
          },
          engagement_score: 0,
          teaching_score: 0,
          participation_score: 0,
          fraud_detected: false,
        },
        session.skill,
        session.skillCategory
      );

      // Create AI monitoring window with interaction metrics
      const windowIndex = session.aiWindows.length;
      const aiWindow = {
        windowIndex,
        timestamp: new Date(),
        transcript: snapshot.transcript,
        speakerActivity: snapshot.speakerActivity,
        interactionMetrics: snapshot.interactionMetrics || undefined,
        engagement_score: aiAnalysis.engagement_score,
        teaching_score: aiAnalysis.teaching_score,
        participation_score: aiAnalysis.participation_score,
        fraud_detected: aiAnalysis.fraud_detected,
        notes: aiAnalysis.notes,
        aiAnalysis: aiAnalysis,
      };

      session.aiWindows.push(aiWindow);

      // Check fraud detection rules with two-way communication awareness
      let fraudDetected = aiAnalysis.fraud_detected;

      // Additional fraud checks (but account for normal teaching/learning patterns)
      if (snapshot.speakerActivity) {
        const p1 = snapshot.speakerActivity.participant1 || snapshot.speakerActivity.teacher;
        const p2 = snapshot.speakerActivity.participant2 || snapshot.speakerActivity.learner;

        // Check if there's been ANY two-way interaction in this window
        const hasTeacherActivity = p1?.speaking === true || 
          (snapshot.transcript && snapshot.transcript.toLowerCase().includes('teacher') || 
           snapshot.transcript && snapshot.transcript.length > 50);
        const hasLearnerActivity = p2?.speaking === true ||
          (snapshot.transcript && (snapshot.transcript.toLowerCase().includes('?') || 
           snapshot.transcript.toLowerCase().includes('question') ||
           snapshot.transcript.toLowerCase().includes('learner')));

        // Fraud: Both completely silent for > 3 minutes (not just teaching pause)
        const bothSilentTooLong = 
          p1?.speaking === false &&
          p2?.speaking === false &&
          (!p1?.silenceDuration || p1.silenceDuration > 180) && // 3 minutes
          (!p2?.silenceDuration || p2.silenceDuration > 180) &&
          (!snapshot.transcript || snapshot.transcript.trim().length < 20); // No meaningful content

        if (bothSilentTooLong && !hasTeacherActivity && !hasLearnerActivity) {
          fraudDetected = true;
        }

        // Fraud: Both cameras off for entire window AND no evidence of interaction
        if (
          p1?.cameraOn === false &&
          p2?.cameraOn === false &&
          (!snapshot.transcript || snapshot.transcript.trim().length < 30) &&
          !hasTeacherActivity &&
          !hasLearnerActivity
        ) {
          fraudDetected = true;
        }

        // Fraud: No two-way communication at all (one person never participated)
        const noTwoWayCommunication = 
          (p1?.speaking === false && p2?.speaking === false) &&
          (!snapshot.transcript || snapshot.transcript.trim().length === 0) &&
          session.aiWindows.length > 1; // Give grace for first window

        if (noTwoWayCommunication && !hasTeacherActivity && !hasLearnerActivity) {
          fraudDetected = true;
        }
      }

      if (fraudDetected) {
        session.fraud_flagged = true;
        session.tokenStatus = 'frozen';
        session.status = 'under_review';
        aiWindow.fraud_detected = true;
        aiWindow.notes = (aiWindow.notes || '') + ' Fraud detected: ' + (fraudDetected ? 'Multiple fraud indicators' : '');
      }

      await session.save();

      // Determine lecture quality if not provided by AI
      const avgScore = (aiAnalysis.engagement_score + aiAnalysis.teaching_score + aiAnalysis.participation_score) / 3;
      const lectureQuality = aiAnalysis.lecture_quality || (
        avgScore >= 80 ? 'excellent' :
        avgScore >= 60 ? 'good' :
        avgScore >= 40 ? 'fair' : 'poor'
      );

      res.status(200).json({
        message: 'Snapshot analyzed',
        analysis: {
          engagement_score: aiAnalysis.engagement_score,
          teaching_score: aiAnalysis.teaching_score,
          participation_score: aiAnalysis.participation_score,
          fraud_detected: fraudDetected,
          notes: aiAnalysis.notes,
          recommendations: aiAnalysis.recommendations || [],
          lecture_quality: lectureQuality,
          key_strengths: aiAnalysis.key_strengths || [],
          improvement_areas: aiAnalysis.improvement_areas || [],
        },
        sessionStatus: session.status,
        tokenStatus: session.tokenStatus,
      });
    } catch (error: any) {
      console.error('Session Monitoring Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
