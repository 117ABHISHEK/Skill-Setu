import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/User';
import { deleteDailyRoom } from '@/lib/daily';
import { analyzeSessionSnapshot } from '@/lib/ai';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const { sessionId } = req.query;
      const userId = req.user?.userId;

      const session = await Session.findOne({ sessionId }).populate('teacher learner');
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Verify user is part of session
      const teacherId = String(session.teacher._id || session.teacher);
      const learnerId = String(session.learner._id || session.learner);
      const currentUserIdStr = String(userId);

      if (
        teacherId !== currentUserIdStr &&
        learnerId !== currentUserIdStr
      ) {
        return res.status(403).json({ error: 'You are not part of this session' });
      }

      if (session.status === 'completed' || session.status === 'cancelled') {
        return res.status(400).json({ error: 'Session already ended' });
      }

      // Close Daily.co room
      try {
        await deleteDailyRoom(session.dailyRoomName);
      } catch (error) {
        console.error('Error deleting Daily.co room:', error);
        // Continue even if room deletion fails
      }

      // Calculate final scores from AI windows
      const aiWindows = session.aiWindows || [];
      if (aiWindows.length > 0) {
        const avgEngagement =
          aiWindows.reduce((sum: number, w: any) => sum + w.engagement_score, 0) / aiWindows.length;
        const avgTeaching =
          aiWindows.reduce((sum: number, w: any) => sum + w.teaching_score, 0) / aiWindows.length;
        const avgParticipation =
          aiWindows.reduce((sum: number, w: any) => sum + w.participation_score, 0) / aiWindows.length;

        session.final_engagement_score = avgEngagement;
        session.final_teaching_score = avgTeaching;
        session.final_participation_score = avgParticipation;
      } else if (session.startTime) {
        // Fallback: Generate final analysis if no windows
        const finalAnalysis = await analyzeSessionSnapshot(
          {
            timestamp: new Date(),
            speakerActivity: {
              teacher: { speaking: true, cameraOn: true },
              learner: { speaking: true, cameraOn: true },
            },
            engagement_score: 50,
            teaching_score: 50,
            participation_score: 50,
            fraud_detected: false,
          },
          session.skill,
          session.skillCategory
        );

        session.final_engagement_score = finalAnalysis.engagement_score;
        session.final_teaching_score = finalAnalysis.teaching_score;
        session.final_participation_score = finalAnalysis.participation_score;
      }

      // Calculate duration
      if (session.startTime) {
        const duration = Math.floor((Date.now() - session.startTime.getTime()) / 60000);
        session.duration = duration;
      }

      session.endTime = new Date();

      // Determine final status
      if (session.fraud_flagged || session.tokenStatus === 'frozen') {
        session.status = 'under_review';
      } else {
        session.status = 'completed';
      }

      // Transfer tokens if session is valid (not flagged)
      if (!session.fraud_flagged && session.tokenStatus === 'pending') {
        const tokenAmount = 10; // Base tokens per session
        const teacher = session.teacher as any;
        const learner = session.learner as any;

        const teacherUser = await User.findById(teacher._id || teacher);
        const learnerUser = await User.findById(learner._id || learner);

        if (teacherUser && learnerUser && learnerUser.tokens >= tokenAmount) {
          learnerUser.tokens -= tokenAmount;
          teacherUser.tokens += tokenAmount;
          teacherUser.reputation += 1;

          await learnerUser.save();
          await teacherUser.save();

          session.tokens_transferred = true;
          session.tokens_amount = tokenAmount;
          session.tokenStatus = 'distributed';
        }
      }

      await session.save();

      res.status(200).json({
        message: 'Session ended successfully',
        session: {
          sessionId: session.sessionId,
          status: session.status,
          duration: session.duration,
          final_engagement_score: session.final_engagement_score,
          final_teaching_score: session.final_teaching_score,
          final_participation_score: session.final_participation_score,
          tokens_transferred: session.tokens_transferred,
          tokenStatus: session.tokenStatus,
        },
      });
    } catch (error: any) {
      console.error('Session End Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
