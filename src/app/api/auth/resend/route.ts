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

  // Keyed by email, not IP: the abuse being stopped is mailbox-bombing one
  // address. Checked BEFORE the lookup -- otherwise the limiter becomes the
  // enumeration oracle it exists to prevent, since a fast 202 means no user and
  // a slow one means mail went out.
  const limit = await checkRateLimit(`rl:verify:${email}`, 3, 3600);
  if (!limit.ok) {
    return jsonError(429, 'RATE_LIMITED', 'Too many attempts. Try again later.');
  }

  const user = await db.orm.public.User.select('id', 'emailVerified').first({ email });

  if (user && !user.emailVerified) {
    const token = await issueVerification(user.id);
    await sendVerificationEmail(email, token);
  }

  // 202 unconditionally: unknown address, already-verified address, and success
  // are indistinguishable.
  return jsonOk({ ok: true }, 202);
}
