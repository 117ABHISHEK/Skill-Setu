import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
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

      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.teacher.toString() !== userId && session.learner.toString() !== userId) {
        return res.status(403).json({ error: 'You are not part of this session' });
      }

      if (session.status !== 'scheduled') {
        return res.status(400).json({ error: 'Session cannot be started' });
      }

      // Start session
      session.status = 'live';
      session.startTime = new Date();
      await session.save();

      res.status(200).json({
        message: 'Session started',
        session: {
          sessionId: session.sessionId,
          dailyRoomUrl: session.dailyRoomUrl,
          status: session.status,
          startTime: session.startTime,
        },
      });
    } catch (error: any) {
      console.error('Session Start Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
