import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';
import { validateInput } from '@/lib/middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate input
  const validation = validateInput(req, res, ['refreshToken']);
  if (validation) return;

  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    await dbConnect();

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken,
    });
  } catch (error: any) {
    console.error('Refresh Token Error:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}
