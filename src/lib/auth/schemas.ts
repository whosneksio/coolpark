import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

export const registerSchema = z.object({
  email,
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(80).optional(),
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(72) });

export const resendSchema = z.object({ email });

export const verifySchema = z.object({ token: z.string().length(64) });
