import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { BAD_JSON, isUniqueViolation, jsonError, jsonOk, readJson } from '@/lib/http';
import { addSpotsSchema } from '@/lib/parking/schemas';
import { db } from '@/lib/prisma/db';

// addparkings
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.user) return guard.response;

  const body = await readJson(request);
  if (body === BAD_JSON) return jsonError(400, 'INVALID_JSON');

  const parsed = addSpotsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'INVALID_BODY', undefined, z.treeifyError(parsed.error));
  }

  const { parkingMapId, labels } = parsed.data;

  try {
    const spots = await db.transaction(async (tx) => {
      const map = await tx.orm.public.ParkingMap.where({ id: parkingMapId }).first();
      if (!map) return null;

      const created = await tx.orm.public.ParkingSpot.createAll(
        labels.map((label) => ({ parkingMapId, label })),
      );

      await tx.orm.public.ParkingMap.where({ id: parkingMapId }).update({
        totalSpots: map.totalSpots + created.length,
        freeSpots: map.freeSpots + created.length,
      });

      return created;
    });

    if (!spots) return jsonError(404, 'MAP_NOT_FOUND');
    return jsonOk({ spots }, 201);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return jsonError(409, 'LABEL_TAKEN', 'That label already exists on this map.');
    }
    throw error;
  }
}