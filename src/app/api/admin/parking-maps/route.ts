import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { BAD_JSON, jsonError, jsonOk, readJson } from '@/lib/http';
import { parkingMapSchema } from '@/lib/parking/schemas';
import { db } from '@/lib/prisma/db';

// viewparkingmap
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.user) return guard.response;

  const maps = await db.orm.public.ParkingMap
    .include('spots', (spots) => spots.select('id', 'label', 'isAvailable'))
    .all();

  return jsonOk({ maps });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.user) return guard.response;

  const body = await readJson(request);
  if (body === BAD_JSON) return jsonError(400, 'INVALID_JSON');

  const parsed = parkingMapSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'INVALID_BODY', undefined, z.treeifyError(parsed.error));
  }

  const map = await db.orm.public.ParkingMap.create({
    ...parsed.data,
    totalSpots: 0,
    freeSpots: 0,
  });

  return jsonOk({ map }, 201);
}