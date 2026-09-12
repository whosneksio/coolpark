import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// prisma 8.0.0-rc.10 emits contract.d.ts relations without `nullable`, which
// ContractToOneRelation requires. Drop this once the emitter is fixed.
// @ts-expect-error -- upstream contract.d.ts emitter bug
export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
