import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';
import { authenticateToken, AuthenticatedRequest } from '@/lib/middleware';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  authenticateToken(req, res, async () => {
    try {
      await dbConnect();

      const { refreshToken } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove refresh token if provided
      if (refreshToken) {
        user.refreshTokens = user.refreshTokens.filter((token: string) => token !== refreshToken);
        await user.save();
      }

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
