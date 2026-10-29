import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import {
  BAD_JSON,
  isForeignKeyViolation,
  isUniqueViolation,
  jsonError,
  jsonOk,
  readJson,
} from '@/lib/http';
import { spotPatchSchema } from '@/lib/parking/schemas';
import { db } from '@/lib/prisma/db';

// modifyparkings
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.user) return guard.response;

  const body = await readJson(request);
  if (body === BAD_JSON) return jsonError(400, 'INVALID_JSON');

  const parsed = spotPatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'INVALID_BODY', undefined, z.treeifyError(parsed.error));
  }

  const { id } = await params;

  try {
    const spot = await db.transaction(async (tx) => {
      const current = await tx.orm.public.ParkingSpot.where({ id }).first();
      if (!current) return null;

      const updated = await tx.orm.public.ParkingSpot.where({ id }).update(parsed.data);

      const { isAvailable } = parsed.data;
      if (isAvailable !== undefined && isAvailable !== current.isAvailable) {
        const map = await tx.orm.public.ParkingMap
          .where({ id: current.parkingMapId })
          .first();
        if (map) {
          await tx.orm.public.ParkingMap.where({ id: map.id }).update({
            freeSpots: Math.min(map.totalSpots, Math.max(0, map.freeSpots + (isAvailable ? 1 : -1))),
          });
        }
      }

      return updated;
    });

    if (!spot) return jsonError(404, 'SPOT_NOT_FOUND');
    return jsonOk({ spot });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return jsonError(409, 'LABEL_TAKEN', 'That label already exists on this map.');
    }
    throw error;
  }
}

// deleteparkings
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.user) return guard.response;

  const { id } = await params;

  try {
    const spot = await db.transaction(async (tx) => {
      const deleted = await tx.orm.public.ParkingSpot.where({ id }).delete();
      if (!deleted) return null;

      const map = await tx.orm.public.ParkingMap.where({ id: deleted.parkingMapId }).first();
      if (map) {
        await tx.orm.public.ParkingMap.where({ id: map.id }).update({
          totalSpots: Math.max(0, map.totalSpots - 1),
          freeSpots: Math.max(0, map.freeSpots - (deleted.isAvailable ? 1 : 0)),
        });
      }

      return deleted;
    });

    if (!spot) return jsonError(404, 'SPOT_NOT_FOUND');
    return jsonOk({ spot });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return jsonError(409, 'SPOT_IN_USE', 'This spot has reservations and cannot be deleted.');
    }
    throw error;
  }
}