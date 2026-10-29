import { describe, expect, test } from 'bun:test';
import { addSpotsSchema, parkingMapPatchSchema, parkingMapSchema, spotPatchSchema } from './schemas';

describe('parking schemas', () => {
  test('map requires name and location', () => {
    expect(parkingMapSchema.safeParse({ name: 'Lot A', location: 'Main St' }).success).toBe(true);
    expect(parkingMapSchema.safeParse({ name: 'Lot A' }).success).toBe(false);
  });

  test('map patch rejects an empty update', () => {
    expect(parkingMapPatchSchema.safeParse({}).success).toBe(false);
    expect(parkingMapPatchSchema.safeParse({ name: 'Lot B' }).success).toBe(true);
  });

  test('add spots requires a uuid map and at least one label', () => {
    const parkingMapId = '6f9619ff-8b86-4d11-b42d-00c04fc964ff';
    expect(addSpotsSchema.safeParse({ parkingMapId, labels: ['A1'] }).success).toBe(true);
    expect(addSpotsSchema.safeParse({ parkingMapId: 'nope', labels: ['A1'] }).success).toBe(false);
    expect(addSpotsSchema.safeParse({ parkingMapId, labels: [] }).success).toBe(false);
  });

  test('spot patch rejects an empty update', () => {
    expect(spotPatchSchema.safeParse({}).success).toBe(false);
    expect(spotPatchSchema.safeParse({ isAvailable: false }).success).toBe(true);
  });
});