import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';
import { moderateContent } from '@/lib/ai';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const { id } = req.query;
      const userId = req.user?.userId;

      if (req.method === 'GET') {
        const course = await Course.findById(id).populate('queries.user', 'name').populate('queries.answeredBy', 'name');
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        // Sort: pinned first, then by upvotes
        const queries = course.queries.sort((a: any, b: any) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.upvotes.length - a.upvotes.length;
        });

        return res.status(200).json({ queries });
      }

      if (req.method === 'POST') {
        // Ask a question
        const validation = validateInput(req, res, ['question']);
        if (validation) return;

        const { question } = req.body;

        // Content moderation
        const moderationResult = await moderateContent(question);
        if (!moderationResult.safe) {
          return res.status(400).json({ error: 'Question does not meet safety guidelines' });
        }

        const course = await Course.findById(id);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        course.queries.push({
          user: userId as any,
          question,
          pinned: false,
          upvotes: [],
        });

        await course.save();

        return res.status(201).json({ message: 'Question posted', query: course.queries[course.queries.length - 1] });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Query Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
