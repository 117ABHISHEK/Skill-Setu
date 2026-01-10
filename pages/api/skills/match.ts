import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Match from '@/models/Match';
import { authenticateToken, AuthenticatedRequest, validateInput } from '@/lib/middleware';

interface MatchResult {
  matched_user_id: string;
  match_score: number;
  reason: string;
  user: any;
}

function calculateMatchScore(
  learnerSkill: any,
  teacherSkill: any,
  learnerReputation: number,
  teacherReputation: number
): number {
  let score = 0;

  // Skill match (50 points)
  if (learnerSkill.name.toLowerCase() === teacherSkill.name.toLowerCase()) {
    score += 50;
  }

  // Proficiency gap (30 points)
  const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const learnerLevel = proficiencyLevels.indexOf(learnerSkill.proficiency);
  const teacherLevel = proficiencyLevels.indexOf(teacherSkill.proficiency);

  if (teacherLevel > learnerLevel) {
    score += 30 - (teacherLevel - learnerLevel) * 5; // Optimal gap gets full points
  } else if (teacherLevel === learnerLevel) {
    score += 20;
  } else {
    score += 10; // Teacher is lower level
  }

  // Reputation (20 points)
  const reputationScore = Math.min(teacherReputation / 50, 20);
  score += reputationScore;

  return Math.min(100, Math.max(0, score));
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const learnerId = req.user?.userId;

      if (req.method === 'POST') {
        // Find matches for a specific skill
        const validation = validateInput(req, res, ['skill', 'category']);
        if (validation) return;

        // Sanitize and validate inputs
        let { skill, category } = req.body;
        
        skill = String(skill || '').trim();
        category = String(category || '').trim();
        
        // Validate lengths
        if (skill.length < 2 || skill.length > 100) {
          return res.status(400).json({ error: 'Skill name must be between 2 and 100 characters' });
        }
        
        // Validate category is in allowed list
        const allowedCategories = ['Creative', 'Music', 'Cooking', 'Dance', 'Tech', 'Languages', 'Soft Skills', 'Gaming', 'Practical'];
        if (!allowedCategories.includes(category)) {
          return res.status(400).json({ error: 'Invalid skill category' });
        }

        const learner = await User.findById(learnerId);
        if (!learner) {
          return res.status(404).json({ error: 'Learner not found' });
        }

        // Find the skill the learner wants to learn
        const learningSkill = learner.skills_learning.find(
          (s: any) => s.name.toLowerCase() === skill.toLowerCase() && s.category === category
        );

        if (!learningSkill) {
          return res.status(400).json({ error: 'Skill not in your learning list' });
        }

        // Find teachers who can teach this skill
        const teachers = await User.find({
          'skills_known': {
            $elemMatch: {
              name: { $regex: new RegExp(skill, 'i') },
              category: category,
            },
          },
          _id: { $ne: learnerId },
        });

        const matches: MatchResult[] = [];

        for (const teacher of teachers) {
          const teachingSkill = teacher.skills_known.find(
            (s: any) => s.name.toLowerCase() === skill.toLowerCase() && s.category === category
          );

          if (teachingSkill) {
            const matchScore = calculateMatchScore(
              learningSkill,
              teachingSkill,
              learner.reputation,
              teacher.reputation
            );

            // Only include matches with score > 40
            if (matchScore > 40) {
              matches.push({
                matched_user_id: teacher._id.toString(),
                match_score: matchScore,
                reason: `Strong match: ${teachingSkill.proficiency} level teacher for ${learningSkill.proficiency} learner. Reputation: ${teacher.reputation}`,
                user: {
                  _id: teacher._id,
                  name: teacher.name,
                  bio: teacher.bio,
                  skills_known: teacher.skills_known,
                  reputation: teacher.reputation,
                },
              });
            }
          }
        }

        // Sort by match score
        matches.sort((a, b) => b.match_score - a.match_score);

        // Create match records
        for (const match of matches.slice(0, 10)) {
          // Check if match already exists
          const existingMatch = await Match.findOne({
            learner: learnerId,
            teacher: match.matched_user_id,
            skill: skill,
            status: 'pending',
          });

          if (!existingMatch) {
            await Match.create({
              learner: learnerId,
              teacher: match.matched_user_id,
              skill: skill,
              skillCategory: category,
              matchScore: match.match_score,
              reason: match.reason,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            });
          }
        }

        return res.status(200).json({ matches: matches.slice(0, 10) });
      }

      if (req.method === 'GET') {
        // Get user's pending matches
        const matches = await Match.find({
          $or: [{ learner: learnerId }, { teacher: learnerId }],
          status: 'pending',
        })
          .populate('learner', 'name email')
          .populate('teacher', 'name email')
          .sort({ createdAt: -1 });

        return res.status(200).json({ matches });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Match Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
