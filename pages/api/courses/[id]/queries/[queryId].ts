import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';
import { moderateContent } from '@/lib/ai';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const { id, queryId } = req.query;
      const userId = req.user?.userId;

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const query = course.queries.id(queryId as string);
      if (!query) {
        return res.status(404).json({ error: 'Query not found' });
      }

      if (req.method === 'PUT') {
        // Answer question (only creator) or pin (only creator)
        if (course.creator.toString() !== userId) {
          return res.status(403).json({ error: 'Only course creator can perform this action' });
        }

        const { answer, pinned } = req.body;

        if (answer !== undefined) {
          const moderationResult = await moderateContent(answer);
          if (!moderationResult.safe) {
            return res.status(400).json({ error: 'Answer does not meet safety guidelines' });
          }

          query.answer = answer;
          query.answeredBy = userId as any;
          query.answeredAt = new Date();
        }

        if (pinned !== undefined) {
          query.pinned = pinned;
        }

        await course.save();

        return res.status(200).json({ message: 'Query updated', query });
      }

      if (req.method === 'POST') {
        // Upvote question
        const upvoteIndex = query.upvotes.indexOf(userId as any);
        if (upvoteIndex > -1) {
          query.upvotes.splice(upvoteIndex, 1);
        } else {
          query.upvotes.push(userId as any);
        }

        await course.save();

        return res.status(200).json({ message: 'Upvote toggled', query });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Query Update Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
