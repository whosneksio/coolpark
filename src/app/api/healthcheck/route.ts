import { jsonError, jsonOk } from '@/lib/http';
import { z } from 'zod';

const requestSchema = z.record(z.string(), z.unknown());

export async function GET(request: Request) {
    if (request.method !== 'GET') {
        return jsonError(405, 'METHOD_NOT_ALLOWED');
    }

    const body = await request.text();
    if (body) {
        let json: unknown;
        try {
            json = JSON.parse(body);
        } catch {
            return jsonError(400, 'INVALID_JSON');
        }

        if (!requestSchema.safeParse(json).success) {
            return jsonError(400, 'INVALID_JSON');
        }
    }

    return jsonOk({ ok: true });
}
