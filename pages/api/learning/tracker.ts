import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Session from '@/models/Session';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';
import { generatePersonalizedAdvice } from '@/lib/ai';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const userId = req.user?.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's completed courses
      const completedCourses = await Course.find({
        _id: { $in: user.courses_created },
        status: 'published',
      });

      // Get user's attended sessions
      const attendedSessions = await Session.find({
        $or: [{ teacher: userId }, { learner: userId }],
        status: 'ended',
      }).sort({ endTime: -1 });

      // Generate AI-powered personalized advice
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const advice = await generatePersonalizedAdvice(
        userId,
        user.progress_tracker,
        completedCourses,
        attendedSessions
      );

      // Calculate statistics
      const stats = {
        totalCoursesCompleted: user.progress_tracker.reduce((sum: number, p: any) => sum + p.coursesCompleted, 0),
        totalSessionsAttended: user.progress_tracker.reduce((sum: number, p: any) => sum + p.sessionsAttended, 0),
        totalXP: user.progress_tracker.reduce((sum: number, p: any) => sum + p.xpEarned, 0),
        currentStreak: Math.max(...user.progress_tracker.map((p: any) => p.streak), 0),
        totalBadges: user.progress_tracker.reduce((sum: number, p: any) => sum + p.badges.length, 0),
        skillsLearning: user.skills_learning.length,
        skillsTeaching: user.skills_known.length,
      };

      res.status(200).json({
        tracker: {
          progress: user.progress_tracker,
          stats,
          advice,
          recentSessions: attendedSessions.slice(0, 5),
          recentCourses: completedCourses.slice(0, 5),
        },
      });
    } catch (error: any) {
      console.error('Learning Tracker Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
