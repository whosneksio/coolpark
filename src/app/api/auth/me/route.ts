import { getCurrentUser } from '@/lib/auth/session';
import { jsonError, jsonOk } from '@/lib/http';

// Two things for later, so they aren't forgotten:
// - When password change/reset lands, that handler must run
//   Session.where({ userId }).deleteAndCount() before responding. A password
//   change that leaves old sessions alive doesn't evict the attacker it was
//   changed because of.
// - Nothing sweeps sessions whose expiresAt has passed. getCurrentUser rejects
//   them but leaves the rows. Fine at one row per login.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError(401, 'UNAUTHENTICATED');

  return jsonOk({ user });
}
