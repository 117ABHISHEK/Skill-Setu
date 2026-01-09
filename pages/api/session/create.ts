import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Match from '@/models/Match';
import { createDailyRoom } from '@/lib/daily';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const userId = req.user?.userId;

      const validation = validateInput(req, res, ['matchId', 'skill', 'category']);
      if (validation) return;

      // Sanitize and validate inputs
      let { matchId, skill, category } = req.body;
      
      matchId = String(matchId || '').trim();
      skill = String(skill || '').trim();
      category = String(category || '').trim();
      
      // Validate lengths
      if (skill.length < 2 || skill.length > 100) {
        return res.status(400).json({ error: 'Skill name must be between 2 and 100 characters' });
      }
      
      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(matchId)) {
        return res.status(400).json({ error: 'Invalid match ID format' });
      }

      // Verify match exists and user is part of it
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (match.status !== 'pending' && match.status !== 'accepted') {
        return res.status(400).json({ error: 'Match is no longer available' });
      }

      if (match.learner.toString() !== userId && match.teacher.toString() !== userId) {
        return res.status(403).json({ error: 'You are not part of this match' });
      }

      // Check if session already exists
      const existingSession = await Session.findOne({
        $or: [
          { teacher: match.teacher, learner: match.learner, skill: skill },
          { teacher: match.learner, learner: match.teacher, skill: skill },
        ],
        status: { $in: ['created', 'scheduled', 'live'] },
      });

      if (existingSession) {
        return res.status(400).json({ error: 'Active session already exists for this match' });
      }

      // Create Daily.co room (private, expires in 2 hours)
      const sessionId = `session-${uuidv4()}`;
      const dailyRoom = await createDailyRoom(sessionId, 120); // 2 hours expiry

      // Determine who is teacher and who is learner
      const isTeacher = match.teacher.toString() === userId;
      const teacherId = match.teacher;
      const learnerId = match.learner;

      // Create session
      const session = await Session.create({
        sessionId,
        dailyRoomUrl: dailyRoom.url,
        dailyRoomName: dailyRoom.name,
        teacher: teacherId,
        learner: learnerId,
        participants: [teacherId, learnerId],
        skill,
        skillCategory: category,
        status: 'created',
        readyStatus: {
          teacher: false,
          learner: false,
        },
        tokenStatus: 'pending',
        fraud_flagged: false,
      });

      // Update match status
      if (match.status === 'pending') {
        match.status = 'accepted';
        await match.save();
      }

      res.status(201).json({
        message: 'Session created successfully',
        session: {
          _id: session._id,
          sessionId: session.sessionId,
          dailyRoomUrl: session.dailyRoomUrl,
          dailyRoomName: session.dailyRoomName,
          status: session.status,
          skill: session.skill,
          teacher: session.teacher,
          learner: session.learner,
          readyStatus: session.readyStatus,
        },
      });
    } catch (error: any) {
      console.error('Session Creation Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
