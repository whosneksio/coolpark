import { describe, expect, test } from 'bun:test';
import { DUMMY_HASH, hashPassword, verifyPassword } from './password';
import { loginSchema, registerSchema, verifySchema } from './schemas';
import { isoIn, randomToken } from './tokens';

describe('schemas', () => {
  test('normalises email before validating', () => {
    const parsed = registerSchema.parse({ email: '  Ada@Example.COM  ', password: 'hunter22' });
    expect(parsed.email).toBe('ada@example.com');
  });

  test('rejects short password and bad email', () => {
    expect(registerSchema.safeParse({ email: 'a@b.co', password: 'short' }).success).toBe(false);
    expect(registerSchema.safeParse({ email: 'nope', password: 'hunter22' }).success).toBe(false);
  });

  // bcrypt truncates past 72 bytes, so without max(72) a 200-char password and
  // its first 72 chars are the same credential.
  test('rejects a password over 72 bytes', () => {
    expect(registerSchema.safeParse({ email: 'a@b.co', password: 'x'.repeat(73) }).success).toBe(
      false,
    );
  });

  test('login accepts any non-empty password so the policy does not leak', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });

  test('verify token must be exactly 64 hex chars', () => {
    expect(verifySchema.safeParse({ token: randomToken() }).success).toBe(true);
    expect(verifySchema.safeParse({ token: 'abc' }).success).toBe(false);
  });
});

describe('tokens', () => {
  test('randomToken is 64 hex chars and unique', () => {
    const a = randomToken();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(randomToken());
  });

  test('isoIn returns a parseable future ISO string', () => {
    const iso = isoIn(60_000);
    expect(iso.endsWith('Z')).toBe(true);
    expect(new Date(iso).getTime()).toBeGreaterThan(Date.now());
  });
});

describe('password', () => {
  test('round-trips and rejects the wrong password', async () => {
    const hash = await hashPassword('hunter22');
    expect(hash).not.toContain('hunter22');
    expect(await verifyPassword('hunter22', hash)).toBe(true);
    expect(await verifyPassword('hunter23', hash)).toBe(false);
  });

  // The whole point of DUMMY_HASH is that comparing against it costs the same as
  // a real hash. A malformed constant returns false instantly and reopens the
  // timing channel this exists to close.
  test('DUMMY_HASH is a real cost-12 hash', async () => {
    expect(DUMMY_HASH).toMatch(/^\$2[aby]\$12\$/);
    expect(await verifyPassword('anything', DUMMY_HASH)).toBe(false);
  });
});
