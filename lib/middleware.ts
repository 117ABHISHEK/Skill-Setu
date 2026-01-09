import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function rateLimiter() {
  const requests = new Map<string, { count: number; resetTime: number }>();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 100;

  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const userRequests = requests.get(ip as string);
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip as string, { count: 1, resetTime: now + WINDOW_MS });
      return next();
    }

    if (userRequests.count >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    userRequests.count++;
    next();
  };
}

export function validateInput(req: NextApiRequest, res: NextApiResponse, requiredFields: string[]) {
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
    // Basic type validation
    if (typeof req.body[field] === 'string' && req.body[field].trim().length === 0) {
      return res.status(400).json({ error: `${field} cannot be empty` });
    }
  }
  return null;
}

/**
 * Sanitize request body to prevent XSS
 */
export function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return body.replace(/<script[^>]*>.*?<\/script>/gi, '').trim();
  }
  if (Array.isArray(body)) {
    return body.map((item) => sanitizeRequestBody(item));
  }
  if (body && typeof body === 'object') {
    const sanitized: any = {};
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        sanitized[key] = sanitizeRequestBody(body[key]);
      }
    }
    return sanitized;
  }
  return body;
}
