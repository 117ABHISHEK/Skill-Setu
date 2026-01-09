import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-this';
const JWT_EXPIRE = '15m';
const JWT_REFRESH_EXPIRE = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

export function generateRefreshToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hashedPassword);
}
