/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

/**
 * Validate and sanitize string length
 */
export function validateStringLength(input: string, maxLength: number, minLength: number = 0): boolean {
  if (typeof input !== 'string') return false;
  const trimmed = input.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return fallback;
    }
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Escape HTML entities
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  // Optional: Add more strength checks
  // if (!/[A-Z]/.test(password)) {
  //   return { valid: false, message: 'Password must contain at least one uppercase letter' };
  // }
  return { valid: true };
}
