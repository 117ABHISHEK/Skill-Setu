import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { rateLimiter, validateInput } from '@/lib/middleware';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 signup attempts per window
  message: 'Too many signup attempts, please try again later',
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
  const validation = validateInput(req, res, ['name', 'email', 'password']);
  if (validation) return;

  let { name, email, password, bio } = req.body;

  // Sanitize inputs
  name = String(name || '').trim();
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');
  bio = bio ? String(bio).trim() : '';

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Name length validation
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
  }

  // Password strength check
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Password must be less than 128 characters' });
  }

  // Bio length validation
  if (bio.length > 500) {
    return res.status(400).json({ error: 'Bio must be less than 500 characters' });
  }

  try {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      bio: bio || '',
      tokens: 100, // Starting tokens
    });

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

    res.status(201).json({
      message: 'User created successfully',
      user: userObj,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
