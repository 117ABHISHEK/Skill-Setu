import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import User from '@/models/User';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const { id } = req.query;
      const userId = req.user?.userId;

      if (req.method === 'GET') {
        const course = await Course.findById(id)
          .populate('creator', 'name email')
          .populate('queries.user', 'name')
          .populate('queries.answeredBy', 'name');

        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        return res.status(200).json({ course });
      }

      if (req.method === 'PUT') {
        const course = await Course.findById(id);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        if (course.creator.toString() !== userId) {
          return res.status(403).json({ error: 'Only course creator can edit' });
        }

        const { title, description, modules, status, price, thumbnail } = req.body;
        if (title) course.title = title;
        if (description) course.description = description;
        if (modules) course.modules = modules;
        if (status) course.status = status;
        if (price !== undefined) course.price = price;
        if (thumbnail) course.thumbnail = thumbnail;

        await course.save();

        return res.status(200).json({ message: 'Course updated', course });
      }

      if (req.method === 'DELETE') {
        const course = await Course.findById(id);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        if (course.creator.toString() !== userId) {
          return res.status(403).json({ error: 'Only course creator can delete' });
        }

        await Course.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Course deleted' });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Course Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
