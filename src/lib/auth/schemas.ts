import { z } from 'zod';

// Trim/lowercase must run BEFORE validation, so pipe -- do not write
// z.email().trim().toLowerCase(), which validates the raw string first
// and rejects "  A@B.COM  ".
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

export const registerSchema = z.object({
  email,
  password: z.string().min(8).max(72), // 72 = bcrypt's byte ceiling; longer is silently truncated
  name: z.string().trim().min(1).max(80).optional(),
});

// min(1), not min(8): a length rule here leaks the password policy and returns a
// different error shape than a wrong password.
export const loginSchema = z.object({ email, password: z.string().min(1).max(72) });

export const resendSchema = z.object({ email });

export const verifySchema = z.object({ token: z.string().length(64) });
