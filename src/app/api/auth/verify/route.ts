import { verifySchema } from '@/lib/auth/schemas';
import { consumeVerification } from '@/lib/auth/verification';
import { jsonError, jsonOk } from '@/lib/http';

// GET because it arrives from a link click. searchParams off the URL is
// synchronous -- only the params/searchParams props are async, and route
// handlers receive neither.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');

  const parsed = verifySchema.safeParse({ token });
  // One error for malformed, unknown, expired, and already-used alike:
  // distinguishing "expired" from "unknown" tells a token-guesser they found a
  // real one. Once there's a UI this becomes a redirect to /verified.
  if (!parsed.success) return jsonError(400, 'INVALID_TOKEN');

  const result = await consumeVerification(parsed.data.token);
  if (result !== 'ok') return jsonError(400, 'INVALID_TOKEN');

  return jsonOk({ ok: true });
}
