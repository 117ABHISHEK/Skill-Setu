import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Match from '@/models/Match';
import User from '@/models/User';
import { createDailyRoom } from '@/lib/daily';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const userId = req.user?.userId;

      const validation = validateInput(req, res, ['matchId', 'skill', 'category']);
      if (validation) return;

      const { matchId, skill, category } = req.body;

      // Verify match exists and user is part of it
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (match.status !== 'pending') {
        return res.status(400).json({ error: 'Match is no longer available' });
      }

      if (match.learner.toString() !== userId && match.teacher.toString() !== userId) {
        return res.status(403).json({ error: 'You are not part of this match' });
      }

      // Check if session already exists
      const existingSession = await Session.findOne({
        teacher: match.teacher,
        learner: match.learner,
        skill: skill,
        status: { $in: ['scheduled', 'live'] },
      });

      if (existingSession) {
        return res.status(400).json({ error: 'Active session already exists' });
      }

      // Create Daily.co room
      const sessionId = `session-${uuidv4()}`;
      const dailyRoom = await createDailyRoom(sessionId, 60); // 1 hour expiry

      // Create session
      const session = await Session.create({
        sessionId,
        dailyRoomUrl: dailyRoom.url,
        teacher: match.teacher,
        learner: match.learner,
        skill,
        skillCategory: category,
        status: 'scheduled',
      });

      // Update match status
      match.status = 'accepted';
      await match.save();

      res.status(201).json({
        message: 'Session created successfully',
        session: {
          _id: session._id,
          sessionId: session.sessionId,
          dailyRoomUrl: session.dailyRoomUrl,
          status: session.status,
        },
      });
    } catch (error: any) {
      console.error('Session Creation Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
