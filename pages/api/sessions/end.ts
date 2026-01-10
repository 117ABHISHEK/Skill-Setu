import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/User';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const userId = req.user?.userId;

      const validation = validateInput(req, res, ['sessionId']);
      if (validation) return;

      const { sessionId } = req.body;

      const session = await Session.findOne({ sessionId }).populate('teacher learner');
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status !== 'live') {
        return res.status(400).json({ error: 'Session is not live' });
      }

      // Calculate final scores from snapshots
      const snapshots = session.monitoring_snapshots;
      if (snapshots.length > 0) {
        const avgEngagement = snapshots.reduce((sum: number, s: any) => sum + s.engagement_score, 0) / snapshots.length;
        const avgTeaching = snapshots.reduce((sum: number, s: any) => sum + s.teaching_score, 0) / snapshots.length;
        const avgParticipation = snapshots.reduce((sum: number, s: any) => sum + s.participation_score, 0) / snapshots.length;

        session.final_engagement_score = avgEngagement;
        session.final_teaching_score = avgTeaching;
        session.final_participation_score = avgParticipation;
      }

      // Calculate duration
      if (session.startTime) {
        const duration = Math.floor((Date.now() - session.startTime.getTime()) / 60000);
        session.duration = duration;
      }

      session.endTime = new Date();
      session.status = session.fraud_flagged ? 'under_review' : 'completed';

      // Transfer tokens if session is valid (not flagged)
      if (!session.fraud_flagged && session.status === 'completed') {
        const tokenAmount = 10; // Base tokens per session
        const teacher = session.teacher as any;
        const learner = session.learner as any;

        if (learner.tokens >= tokenAmount) {
          learner.tokens -= tokenAmount;
          teacher.tokens += tokenAmount;
          teacher.reputation += 1;

          await learner.save();
          await teacher.save();

          session.tokens_transferred = true;
          session.tokens_amount = tokenAmount;
        }
      }

      await session.save();

      res.status(200).json({
        message: 'Session ended',
        session: {
          sessionId: session.sessionId,
          status: session.status,
          final_engagement_score: session.final_engagement_score,
          final_teaching_score: session.final_teaching_score,
          final_participation_score: session.final_participation_score,
          tokens_transferred: session.tokens_transferred,
        },
      });
    } catch (error: any) {
      console.error('Session End Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
