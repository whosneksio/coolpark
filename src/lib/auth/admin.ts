import 'server-only';
import { jsonError } from '@/lib/http';
import { getCurrentUser } from './session';

type AdminUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireAdmin(): Promise<
  { user: AdminUser; response: null } | { user: null; response: Response }
> {
  const user = await getCurrentUser();
  if (!user) return { user: null, response: jsonError(401, 'UNAUTHENTICATED') };
  if (!user.isAdmin) return { user: null, response: jsonError(403, 'FORBIDDEN') };

  return { user, response: null };
}