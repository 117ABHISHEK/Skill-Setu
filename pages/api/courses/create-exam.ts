import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import Course from '@/models/Course';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await dbConnect();
      const userId = req.user?.userId;

      const validation = validateInput(req, res, ['courseId', 'title', 'questions']);
      if (validation) return;

      const { courseId, title, description, questions, passingScore, timeLimit, maxAttempts, randomized } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.creator.toString() !== userId) {
        return res.status(403).json({ error: 'Only course creator can create exams' });
      }

      const exam = await Exam.create({
        course: courseId,
        title,
        description,
        questions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 60,
        maxAttempts: maxAttempts || 3,
        randomized: randomized !== false,
      });

      course.hasExam = true;
      course.exam = exam._id;
      await course.save();

      res.status(201).json({
        message: 'Exam created successfully',
        exam,
      });
    } catch (error: any) {
      console.error('Exam Creation Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
