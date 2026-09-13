import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { checkRateLimit, clientIp } from '@/lib/auth/rate-limit';
import { registerSchema } from '@/lib/auth/schemas';
import { issueVerification } from '@/lib/auth/verification';
import { BAD_JSON, jsonError, jsonOk, readJson } from '@/lib/http';
import { sendVerificationEmail } from '@/lib/mail';
import { db } from '@/lib/prisma/db';

export async function POST(request: Request) {
  const limit = await checkRateLimit(`rl:register:${clientIp(request)}`, 10, 3600);
  if (!limit.ok) {
    return jsonError(429, 'RATE_LIMITED', 'Too many attempts. Try again later.');
  }

  const body = await readJson(request);
  if (body === BAD_JSON) return jsonError(400, 'INVALID_JSON');

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'INVALID_BODY', undefined, z.treeifyError(parsed.error));
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await hashPassword(password);

  let token: string;
  try {
    token = await db.transaction(async (tx) => {
      const user = await tx.orm.public.User
        .select('id')
        .create({ email, password: passwordHash, name: name ?? null });
      return issueVerification(user.id, tx);
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return jsonError(409, 'EMAIL_TAKEN', 'That email is already registered.');
    }
    throw error;
  }

  await sendVerificationEmail(email, token);

  return jsonOk({ ok: true }, 201);
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'sqlState' in error &&
    (error as { sqlState?: unknown }).sqlState === '23505'
  );
}
