import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Match from '@/models/Match';
import Notification from '@/models/Notification';
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
        const learner = await User.findById(learnerId);
        if (!learner) {
          return res.status(404).json({ error: 'Learner not found' });
        }

        let { skill, category } = req.body;
        let skillsToSearch = [];

        if (skill && category) {
          // Specific search
          skillsToSearch = [{ name: skill, category }];
        } else {
          // Automated recommendations based on all learning skills
          skillsToSearch = learner.skills_learning.map((s: any) => ({ name: s.name, category: s.category }));
        }

        const allMatches: MatchResult[] = [];

        for (const learningSkill of skillsToSearch) {
          const { name: skillName, category: skillCategory } = learningSkill;
          
          // Find teachers who can teach this skill
          const teachers = await User.find({
            'skills_known': {
              $elemMatch: {
                name: { $regex: new RegExp(skillName, 'i') },
                category: skillCategory,
              },
            },
            _id: { $ne: learnerId },
          });

          for (const teacher of teachers) {
            const teachingSkill = teacher.skills_known.find(
              (s: any) => s.name.toLowerCase() === skillName.toLowerCase() && s.category === skillCategory
            );

            if (teachingSkill) {
              const matchScore = calculateMatchScore(
                learningSkill,
                teachingSkill,
                learner.reputation,
                teacher.reputation
              );

              if (matchScore > 40) {
                // Check if match already exists
                const existingMatch = await Match.findOne({
                  $or: [
                    { learner: learnerId, teacher: teacher._id, skill: skillName },
                    { learner: teacher._id, teacher: learnerId, skill: skillName }
                  ]
                });

                if (!existingMatch && allMatches.length < 20) {
                   // Create the match record automatically for recommendations
                   await Match.create({
                      learner: learnerId,
                      teacher: teacher._id,
                      skill: skillName,
                      skillCategory: skillCategory,
                      matchScore: matchScore,
                      reason: `Strong match: ${teachingSkill.proficiency} level teacher for ${learningSkill.proficiency} learner. Reputation: ${teacher.reputation}`,
                      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                   });

                   // Notify the teacher
                   await Notification.create({
                      recipient: teacher._id,
                      type: 'match_new',
                      title: 'New Skill Match Suggestion!',
                      message: `${learner.name} is looking to learn ${skillName}. You've been matched as a potential teacher!`,
                      link: '/match',
                   });
                }

                allMatches.push({
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
        }

        // Sort by match score and remove duplicates if any
        const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.matched_user_id + m.user.skills_known[0].name, m])).values());
        uniqueMatches.sort((a, b) => b.match_score - a.match_score);

        return res.status(200).json({ matches: uniqueMatches.slice(0, 10) });
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
