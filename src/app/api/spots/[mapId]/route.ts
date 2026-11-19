import { jsonError, jsonOk } from '@/lib/http';
import { db } from '@/lib/prisma/db';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/spots/<parkingMapId>  → the map plus all of its spots
// GET /api/spots/<label>         → spot by label, with its map (labels are only unique per map)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mapId: string }> },
) {
  const { mapId } = await params;

  if (UUID_RE.test(mapId)) {
    const map = await db.orm.public.ParkingMap
      .where({ id: mapId })
      .select('id', 'name', 'location', 'totalSpots', 'freeSpots')
      .include('spots', (spots) => spots.select('id', 'label', 'isAvailable').orderBy((s) => s.label.asc()))
      .first();

    if (!map) return jsonError(404, 'MAP_NOT_FOUND');
    return jsonOk({ map });
  }

  const spots = await db.orm.public.ParkingSpot
    .where({ label: mapId })
    .select('id', 'label', 'isAvailable', 'parkingMapId')
    .include('parkingMap', (map) => map.select('id', 'name', 'location'))
    .all();

  if (spots.length === 0) return jsonError(404, 'SPOT_NOT_FOUND');
  if (spots.length === 1) return jsonOk({ spot: spots[0] });

  // Same label exists on several maps — the caller has to disambiguate.
  return jsonError(400, 'AMBIGUOUS_LABEL', 'That label exists on more than one map.', {
    candidates: spots,
  });
}