import { jsonError, jsonOk } from '@/lib/http';
import { db } from '@/lib/prisma/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mapId: string; label: string }> },
) {
  const { mapId, label } = await params;

  const spot = await db.orm.public.ParkingSpot
    .where({ parkingMapId: mapId, label })
    .first();

  if (!spot) return jsonError(404, 'SPOT_NOT_FOUND');
  return jsonOk({ spot });
}