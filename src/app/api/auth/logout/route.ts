import { destroySession } from '@/lib/auth/session';
import { jsonOk } from '@/lib/http';

// POST, not GET, so a stray <img src> or a link prefetch can't log people out.
export async function POST() {
  await destroySession();

  // Idempotent: 200 even when there was no session.
  return jsonOk({ ok: true });
}
