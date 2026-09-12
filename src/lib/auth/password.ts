import bcrypt from 'bcryptjs';

export const BCRYPT_COST = 12;

// A real cost-12 hash of a throwaway string. Hardcoded rather than hashed at
// module load, which would add ~400ms to every cold start. Login compares
// against it when the email doesn't exist so both paths cost the same.
export const DUMMY_HASH = '$2b$12$gt5B89fVL7g8rYI6oNooVeTNOfNYVeAqQ8WPWCcq8goFTIW8Elat6';

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_COST);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
