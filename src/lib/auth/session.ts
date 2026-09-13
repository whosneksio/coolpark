import 'server-only';
import { cookies } from 'next/headers';
import { db } from '@/lib/prisma/db';
import { SESSION_TTL_MS, isoIn, randomToken } from './tokens';

export const SESSION_COOKIE = 'session';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_TTL_MS / 1000,
} as const;


export async function createSession(userId: string) {
  const token = randomToken();
  await db.orm.public.Session.create({ userId, token, expiresAt: isoIn(SESSION_TTL_MS) });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions);
}


export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.orm.public.Session.where({ token })
    .select('id', 'userId', 'expiresAt')
    .first();
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await db.orm.public.Session.where({ id: session.id }).delete();
    return null;
  }

  return db.orm.public.User.where({ id: session.userId })
    .select('id', 'email', 'name', 'emailVerified', 'createdAt')
    .first();
}


export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) await db.orm.public.Session.where({ token }).delete();
  jar.delete(SESSION_COOKIE);
}
