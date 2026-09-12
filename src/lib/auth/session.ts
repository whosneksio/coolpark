import 'server-only';
import { cookies } from 'next/headers';
import { db } from '@/lib/prisma/db';
import { SESSION_TTL_MS, isoIn, randomToken } from './tokens';

export const SESSION_COOKIE = 'session';

// Both flags are deliberate. `secure: true` unconditionally breaks localhost
// login -- the browser accepts the Set-Cookie and then never sends it back,
// which looks like a broken session rather than a cookie problem. And
// `sameSite: 'strict'` would break the verification link, since a click from a
// mail client is a cross-site navigation.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_TTL_MS / 1000,
} as const;

/** Inserts the session row and sets the cookie. Route handlers only -- writes cookies. */
export async function createSession(userId: string) {
  const token = randomToken();
  await db.orm.public.Session.create({ userId, token, expiresAt: isoIn(SESSION_TTL_MS) });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions);
}

/**
 * The only place a cookie becomes a user. No route should re-implement this.
 * Deletes the row on expiry so an expired session can't be resurrected.
 */
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.orm.public.Session.where({ token })
    .select('id', 'userId', 'expiresAt')
    .first();
  if (!session) return null;

  // Parse both sides: Postgres renders timestamptz with +00 and toISOString with
  // Z, so comparing these as strings is not valid and never expires anything.
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await db.orm.public.Session.where({ id: session.id }).delete();
    return null;
  }

  return db.orm.public.User.where({ id: session.userId })
    .select('id', 'email', 'name', 'emailVerified', 'createdAt')
    .first();
}

/** Idempotent. Deletes the row FIRST -- clearing only the cookie leaves the token valid forever. */
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) await db.orm.public.Session.where({ token }).delete();
  jar.delete(SESSION_COOKIE);
}
