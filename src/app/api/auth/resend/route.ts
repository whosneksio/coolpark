import { z } from 'zod';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { resendSchema } from '@/lib/auth/schemas';
import { issueVerification } from '@/lib/auth/verification';
import { BAD_JSON, jsonError, jsonOk, readJson } from '@/lib/http';
import { sendVerificationEmail } from '@/lib/mail';
import { db } from '@/lib/prisma/db';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (body === BAD_JSON) return jsonError(400, 'INVALID_JSON');

  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'INVALID_BODY', undefined, z.treeifyError(parsed.error));
  }

  const { email } = parsed.data;

  const limit = await checkRateLimit(`rl:verify:${email}`, 3, 3600);
  if (!limit.ok) {
    return jsonError(429, 'RATE_LIMITED', 'Too many attempts. Try again later.');
  }

  const user = await db.orm.public.User.select('id', 'emailVerified').first({ email });

  if (user && !user.emailVerified) {
    const token = await issueVerification(user.id);
    await sendVerificationEmail(email, token);
  }

  return jsonOk({ ok: true }, 202);
}
