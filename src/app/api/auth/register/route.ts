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
    // Atomic: a user with no verification row can't log in and can't be
    // recovered without the resend endpoint.
    token = await db.transaction(async (tx) => {
      const user = await tx.orm.public.User
        .select('id')
        .create({ email, password: passwordHash, name: name ?? null });
      return issueVerification(user.id, tx);
    });
  } catch (error) {
    // The unique index is the arbiter. Pre-checking with first({ email }) and
    // branching lets two concurrent registrations both pass the check.
    if (isUniqueViolation(error)) {
      // A 409 does disclose that an address is registered. There's no way to
      // reject duplicates and hide membership at this endpoint, and the
      // alternative (always 201 + notify the existing owner) needs real mail
      // delivery. Deliberate: enumeration resistance lives on login and resend.
      return jsonError(409, 'EMAIL_TAKEN', 'That email is already registered.');
    }
    throw error;
  }

  await sendVerificationEmail(email, token);

  // No session -- login is gated on verification.
  return jsonOk({ ok: true }, 201);
}

function isUniqueViolation(error: unknown) {
  // isUniqueConstraintViolation lives in @prisma/orm-family-sql/errors, but that
  // package is a transitive dep -- importing it is a phantom dependency. Its
  // whole body is this sqlState check.
  return (
    typeof error === 'object' &&
    error !== null &&
    'sqlState' in error &&
    (error as { sqlState?: unknown }).sqlState === '23505'
  );
}
