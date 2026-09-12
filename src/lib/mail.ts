/**
 * Console stub. When a real provider lands it's one
 * `if (process.env.RESEND_API_KEY)` at the top of this function.
 */
export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.APP_URL ?? 'http://localhost:3000'}/api/auth/verify?token=${token}`;
  console.log(`[mail] verification for ${to}: ${url}`);
}
