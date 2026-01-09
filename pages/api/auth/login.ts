import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateInput } from '@/lib/middleware';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: 'Too many login attempts, please try again later',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  await new Promise((resolve, reject) => {
    limiter(req as any, res as any, (result: any) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });

  // Validate input
  const validation = validateInput(req, res, ['email', 'password']);
  if (validation) return;

  // Sanitize and validate inputs
  let { email, password } = req.body;
  
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Validate password not empty
  if (!password || password.length === 0) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    await dbConnect();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        error: `Account locked. Please try again in ${lockMinutes} minutes.`,
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }

      await user.save();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Return user (without password)
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    res.status(200).json({
      message: 'Login successful',
      user: userObj,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
