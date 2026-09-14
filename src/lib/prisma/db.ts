import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// @ts-expect-error -- upstream contract.d.ts emitter bug: relations missing `nullable`
export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
