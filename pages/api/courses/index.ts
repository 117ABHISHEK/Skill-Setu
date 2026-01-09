import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    try {
      await dbConnect();

      if (req.method === 'GET') {
        const { skill, category, status } = req.query;

        const filter: any = {};
        if (skill) filter.skill = { $regex: new RegExp(skill as string, 'i') };
        if (category) filter.skillCategory = category;
        if (status) filter.status = status;
        else filter.status = 'published'; // Only show published courses by default

        const courses = await Course.find(filter)
          .populate('creator', 'name email')
          .sort({ createdAt: -1 })
          .limit(50);

        return res.status(200).json({ courses });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Courses List Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
