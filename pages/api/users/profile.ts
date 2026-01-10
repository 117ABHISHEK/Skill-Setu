import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  return await authenticateToken(req, res, async () => {
    try {
      await dbConnect();
      const userId = req.user?.userId;

      if (req.method === 'GET') {
        const user = await User.findById(userId).select('-password -refreshTokens');
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ user });
      }

      if (req.method === 'PUT') {
        let { name, bio, skills_known, skills_learning } = req.body;
        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Sanitize and validate inputs
        if (name !== undefined) {
          name = String(name).trim();
          if (name.length < 2 || name.length > 100) {
            return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
          }
          user.name = name;
        }
        
        if (bio !== undefined) {
          bio = String(bio).trim();
          if (bio.length > 500) {
            return res.status(400).json({ error: 'Bio must be less than 500 characters' });
          }
          user.bio = bio;
        }
        
        // Validate skills arrays
        if (skills_known !== undefined) {
          if (!Array.isArray(skills_known)) {
            return res.status(400).json({ error: 'skills_known must be an array' });
          }
          if (skills_known.length > 50) {
            return res.status(400).json({ error: 'Maximum 50 skills allowed' });
          }
          // Validate each skill
          for (const skill of skills_known) {
            if (skill.name && (skill.name.length < 1 || skill.name.length > 100)) {
              return res.status(400).json({ error: 'Skill name must be between 1 and 100 characters' });
            }
          }
          user.skills_known = skills_known;
        }
        
        if (skills_learning !== undefined) {
          if (!Array.isArray(skills_learning)) {
            return res.status(400).json({ error: 'skills_learning must be an array' });
          }
          if (skills_learning.length > 50) {
            return res.status(400).json({ error: 'Maximum 50 skills allowed' });
          }
          // Validate each skill
          for (const skill of skills_learning) {
            if (skill.name && (skill.name.length < 1 || skill.name.length > 100)) {
              return res.status(400).json({ error: 'Skill name must be between 1 and 100 characters' });
            }
          }
          user.skills_learning = skills_learning;
        }

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshTokens;

        return res.status(200).json({ message: 'Profile updated', user: userObj });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('Profile Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
