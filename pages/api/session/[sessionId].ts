import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const { sessionId } = req.query;
      const userId = req.user?.userId;

      if (req.method === 'GET') {
        if (!sessionId || typeof sessionId !== 'string') {
          return res.status(400).json({ error: 'Invalid session ID' });
        }

        const session = await Session.findOne({ sessionId })
          .populate('teacher', 'name email')
          .populate('learner', 'name email')
          .populate('participants', 'name email');

        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        // Verify user is part of session
        const teacherId = String(session.teacher._id || session.teacher);
        const learnerId = String(session.learner._id || session.learner);
        const currentUserIdStr = String(userId);
        
        const isParticipant = session.participants.some((p: any) => String(p._id || p) === currentUserIdStr);

        if (
          teacherId !== currentUserIdStr &&
          learnerId !== currentUserIdStr &&
          !isParticipant
        ) {
          return res.status(403).json({ error: 'You are not part of this session' });
        }

        // Generate meeting token for private room
        let token = '';
        try {
          const { getDailyRoomToken } = require('@/lib/daily');
          token = await getDailyRoomToken(
            session.dailyRoomName,
            userId,
            teacherId === userId // Teacher is owner
          );
        } catch (error) {
          console.error('Error generating Daily token:', error);
          // Continue without token if it fails (not ideal for private rooms)
        }

        return res.status(200).json({ session, token });
      }

      if (req.method === 'PUT') {
        const session = await Session.findOne({ sessionId });

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

        const { action, aiWindow, status } = req.body;

        // Handle ready status update
        if (action === 'markReady') {
          const isTeacher = teacherId === currentUserIdStr;
          if (isTeacher) {
            session.readyStatus.teacher = true;
          } else {
            session.readyStatus.learner = true;
          }

          // If both ready and status is 'created', move to 'live'
          if (
            session.readyStatus.teacher &&
            session.readyStatus.learner &&
            session.status === 'created'
          ) {
            session.status = 'live';
            session.startTime = new Date();
          }
        }

        // Handle AI monitoring window update
        if (aiWindow) {
          session.aiWindows.push({
            windowIndex: session.aiWindows.length,
            timestamp: new Date(),
            ...aiWindow,
          });

          // Check for fraud
          if (aiWindow.fraud_detected) {
            session.fraud_flagged = true;
            session.tokenStatus = 'frozen';
            session.status = 'under_review';
          }
        }

        // Handle status update
        if (status) {
          session.status = status;
        }

        await session.save();

        // Refetch with population to ensure frontend has all data
        const updatedSession = await Session.findById(session._id)
          .populate('teacher', 'name email')
          .populate('learner', 'name email')
          .populate('participants', 'name email');

        return res.status(200).json({
          message: 'Session updated',
          session: updatedSession,
        });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Session Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
