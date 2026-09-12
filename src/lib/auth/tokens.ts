import { randomBytes } from 'node:crypto';

// Hex, not base64url, so the length is fixed at 64 and verifySchema can assert it.
export const randomToken = () => randomBytes(32).toString('hex'); // 256 bits, 64 chars

export const isoIn = (ms: number) => new Date(Date.now() + ms).toISOString();

export const SESSION_TTL_MS = 7 * 864e5; // 7 days
export const VERIFY_TTL_MS = 864e5; // 24 hours
