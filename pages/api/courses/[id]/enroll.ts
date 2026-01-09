import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import User from '@/models/User';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const { id } = req.query;
      const userId = req.user?.userId;

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.status !== 'published') {
        return res.status(400).json({ error: 'Course is not available for enrollment' });
      }

      // Check if already enrolled
      if (course.enrolledUsers.includes(userId as any)) {
        return res.status(400).json({ error: 'Already enrolled in this course' });
      }

      // Check if user has enough tokens
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.tokens < course.price) {
        return res.status(400).json({ error: 'Insufficient tokens' });
      }

      // Deduct tokens and enroll
      user.tokens -= course.price;
      await user.save();

      course.enrolledUsers.push(userId as any);
      await course.save();

      // Update progress tracker
      const progressTracker = user.progress_tracker.find((p: any) => p.skill === course.skill);
      if (!progressTracker) {
        user.progress_tracker.push({
          skill: course.skill,
          coursesCompleted: 0,
          sessionsAttended: 0,
          xpEarned: 0,
          lastActive: new Date(),
          streak: 0,
          badges: [],
        });
      }

      await user.save();

      res.status(200).json({ message: 'Enrolled successfully', course });
    } catch (error: any) {
      console.error('Enrollment Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
