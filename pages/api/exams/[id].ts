import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Exam from '@/models/Exam';
import Course from '@/models/Course';
import Certificate from '@/models/Certificate';
import User from '@/models/User';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const { id } = req.query;
      const userId = req.user?.userId;

      if (req.method === 'GET') {
        const exam = await Exam.findById(id).populate('course');
        if (!exam) {
          return res.status(404).json({ error: 'Exam not found' });
        }

        // Check if user is enrolled
        const course = await Course.findById(exam.course);
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        if (!course.enrolledUsers.includes(userId as any)) {
          return res.status(403).json({ error: 'You must be enrolled in the course to take the exam' });
        }

        // Check attempts
        const userAttempts = exam.attempts.filter((a: any) => a.user.toString() === userId);
        if (userAttempts.length >= exam.maxAttempts) {
          return res.status(400).json({ error: 'Maximum attempts reached' });
        }

        // Return exam (randomize if needed)
        let questions = exam.questions;
        if (exam.randomized) {
          questions = [...exam.questions].sort(() => Math.random() - 0.5);
        }

        return res.status(200).json({
          exam: {
            _id: exam._id,
            title: exam.title,
            description: exam.description,
            questions: questions.map((q: any, idx: number) => ({
              index: idx,
              question: q.question,
              type: q.type,
              options: q.options,
              points: q.points,
            })),
            timeLimit: exam.timeLimit,
            passingScore: exam.passingScore,
            attemptsRemaining: exam.maxAttempts - userAttempts.length,
          },
        });
      }

      if (req.method === 'POST') {
        // Submit exam
        const validation = validateInput(req, res, ['answers', 'timeSpent']);
        if (validation) return;

        const { answers, timeSpent } = req.body;

        const exam = await Exam.findById(id).populate('course');
        if (!exam) {
          return res.status(404).json({ error: 'Exam not found' });
        }

        // Check attempts
        const userAttempts = exam.attempts.filter((a: any) => a.user.toString() === userId);
        if (userAttempts.length >= exam.maxAttempts) {
          return res.status(400).json({ error: 'Maximum attempts reached' });
        }

        // Grade exam
        let totalScore = 0;
        let totalPoints = 0;
        const gradedAnswers: any[] = [];

        for (const answer of answers) {
          const question = exam.questions[answer.questionIndex];
          if (!question) continue;

          totalPoints += question.points;
          let pointsEarned = 0;

          if (question.type === 'mcq') {
            const correctAnswers = Array.isArray(question.correctAnswer)
              ? question.correctAnswer
              : [question.correctAnswer];
            const userAnswers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];

            if (JSON.stringify(correctAnswers.sort()) === JSON.stringify(userAnswers.sort())) {
              pointsEarned = question.points;
            }
          } else {
            // Short answer - simple comparison (can be enhanced with AI)
            if (
              question.correctAnswer.toString().toLowerCase().trim() ===
              answer.answer.toString().toLowerCase().trim()
            ) {
              pointsEarned = question.points;
            }
          }

          totalScore += pointsEarned;
          gradedAnswers.push({
            questionIndex: answer.questionIndex,
            answer: answer.answer,
            pointsEarned,
          });
        }

        const percentage = (totalScore / totalPoints) * 100;
        const passed = percentage >= exam.passingScore;

        // Create attempt
        const attempt = {
          user: userId as any,
          answers: gradedAnswers,
          score: totalScore,
          totalPoints,
          percentage,
          passed,
          timeSpent,
        };

        exam.attempts.push(attempt);
        await exam.save();

        // If passed and course has certificate, create certificate
        if (passed) {
          const course = exam.course as any;
          const user = await User.findById(userId);
          const creator = await User.findById(course.creator);

          // Check if certificate already exists
          const existingCert = await Certificate.findOne({
            user: userId,
            course: course._id,
          });

          if (!existingCert) {
            const certificateId = `cert-${uuidv4()}`;
            await Certificate.create({
              certificateId,
              user: userId as any,
              course: course._id,
              exam: exam._id,
              examScore: percentage,
              skill: course.skill,
              skillCategory: course.skillCategory,
              issuedBy: course.creator,
              metadata: {
                issueDate: new Date(),
                verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${certificateId}`,
              },
            });

            // Update user progress
            if (user) {
              const progressTracker = user.progress_tracker.find((p: any) => p.skill === course.skill);
              if (progressTracker) {
                progressTracker.coursesCompleted += 1;
                progressTracker.xpEarned += 100;
              }

              // Add badge
              if (user.progress_tracker.length === 0 || !progressTracker) {
                user.progress_tracker.push({
                  skill: course.skill,
                  coursesCompleted: 1,
                  sessionsAttended: 0,
                  xpEarned: 100,
                  lastActive: new Date(),
                  streak: 1,
                  badges: ['first-course'],
                });
              } else if (progressTracker && !progressTracker.badges.includes('course-master')) {
                progressTracker.badges.push('course-master');
              }

              await user.save();
            }
          }
        }

        return res.status(200).json({
          message: 'Exam submitted',
          result: {
            score: totalScore,
            totalPoints,
            percentage,
            passed,
            attempt: exam.attempts[exam.attempts.length - 1],
          },
        });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Exam Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
