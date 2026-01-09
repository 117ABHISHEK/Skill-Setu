import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const userId = req.user?.userId;

      if (req.method === 'GET') {
        const { status, role } = req.query;

        // Find sessions where user is either teacher or learner
        const query: any = {
          $or: [{ teacher: userId }, { learner: userId }],
        };

        if (status) {
          query.status = status;
        }

        const sessions = await Session.find(query)
          .populate('teacher', 'name email')
          .populate('learner', 'name email')
          .sort({ createdAt: -1 })
          .limit(50);

        // Filter by role if specified
        let filteredSessions = sessions;
        if (role === 'teacher') {
          filteredSessions = sessions.filter(
            (s) => s.teacher.toString() === userId || (s.teacher as any)._id?.toString() === userId
          );
        } else if (role === 'learner') {
          filteredSessions = sessions.filter(
            (s) => s.learner.toString() === userId || (s.learner as any)._id?.toString() === userId
          );
        }

        return res.status(200).json({ sessions: filteredSessions });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Sessions List Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
