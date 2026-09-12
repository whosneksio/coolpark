import { z } from 'zod';
import { DUMMY_HASH, verifyPassword } from '@/lib/auth/password';
import { checkRateLimit, clientIp } from '@/lib/auth/rate-limit';
import { loginSchema } from '@/lib/auth/schemas';
import { createSession } from '@/lib/auth/session';
import { BAD_JSON, jsonError, jsonOk, readJson } from '@/lib/http';
import { db } from '@/lib/prisma/db';

export async function POST(request: Request) {
  // First, before any DB work.
  const limit = await checkRateLimit(`rl:login:${clientIp(request)}`, 5, 900);
  if (!limit.ok) {
    return Response.json(
      { error: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const body = await readJson(request);
  if (body === BAD_JSON) return jsonError(400, 'INVALID_JSON');

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'INVALID_BODY', undefined, z.treeifyError(parsed.error));
  }

  const { email, password } = parsed.data;

  const user = await db.orm.public.User
    .select('id', 'email', 'name', 'password', 'emailVerified')
    .first({ email });

  // The ?? DUMMY_HASH is the entire timing defence, and the two checks must be
  // combined AFTER the compare. Returning early on !user would make account
  // existence measurable with a stopwatch, since bcrypt dominates the response.
  const valid = await verifyPassword(password, user?.password ?? DUMMY_HASH);
  if (!user || !valid) return jsonError(401, 'INVALID_CREDENTIALS');

  // Deliberately distinguishable, unlike the credential errors: the caller
  // already proved the password, so the client can offer a resend.
  if (!user.emailVerified) return jsonError(403, 'EMAIL_NOT_VERIFIED');

  await createSession(user.id);

  // Field by field, not a spread: a column added later can't leak.
  return jsonOk({ user: { id: user.id, email: user.email, name: user.name } });
}
