import { verifySchema } from '@/lib/auth/schemas';
import { consumeVerification } from '@/lib/auth/verification';
import { jsonError, jsonOk } from '@/lib/http';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');

  const parsed = verifySchema.safeParse({ token });
  if (!parsed.success) return jsonError(400, 'INVALID_TOKEN');

  const result = await consumeVerification(parsed.data.token);
  if (result !== 'ok') return jsonError(400, 'INVALID_TOKEN');

  return jsonOk({ ok: true });
}
