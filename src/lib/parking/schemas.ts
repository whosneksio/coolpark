import { z } from 'zod';

const label = z.string().trim().min(1).max(40);

export const parkingMapSchema = z.object({
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(200),
});

export const parkingMapPatchSchema = parkingMapSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required.' });

export const addSpotsSchema = z.object({
  parkingMapId: z.uuid(),
  labels: z.array(label).min(1).max(100),
});

export const spotPatchSchema = z
  .object({ label: label.optional(), isAvailable: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required.' });