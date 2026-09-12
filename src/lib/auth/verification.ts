import { db } from '@/lib/prisma/db';
import { VERIFY_TTL_MS, isoIn, randomToken } from './tokens';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Deletes the user's existing rows first, so the most recently mailed link is
 * the only live one -- otherwise every resend leaves another valid token out.
 */
export async function issueVerification(userId: string, tx: Tx | typeof db = db) {
  const token = randomToken();

  await tx.orm.public.EmailVerification.where({ userId }).deleteAndCount();
  await tx.orm.public.EmailVerification.create({
    userId,
    token,
    expiresAt: isoIn(VERIFY_TTL_MS),
  });

  return token;
}

export type ConsumeResult = 'ok' | 'invalid' | 'expired';

/**
 * Single-use by construction: the delete IS the claim. Two concurrent requests
 * with the same token both issue the delete, but only one gets a row back --
 * the other sees null and is told the token is invalid.
 */
export async function consumeVerification(token: string): Promise<ConsumeResult> {
  const row = await db.orm.public.EmailVerification.where({ token }).delete();
  if (!row) return 'invalid';

  if (new Date(row.expiresAt).getTime() <= Date.now()) return 'expired';

  await db.orm.public.User.where({ id: row.userId }).update({ emailVerified: true });
  return 'ok';
}
