import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { BAD_JSON, jsonError, jsonOk, readJson } from '@/lib/http';
import { parkingMapPatchSchema } from '@/lib/parking/schemas';
import { db } from '@/lib/prisma/db';

// modifymap
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.user) return guard.response;

  const body = await readJson(request);
  if (body === BAD_JSON) return jsonError(400, 'INVALID_JSON');

  const parsed = parkingMapPatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'INVALID_BODY', undefined, z.treeifyError(parsed.error));
  }

  const { id } = await params;
  const map = await db.orm.public.ParkingMap.where({ id }).update(parsed.data);
  if (!map) return jsonError(404, 'MAP_NOT_FOUND');

  return jsonOk({ map });
}