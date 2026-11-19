import { hashPassword } from '../src/lib/auth/password.ts';
import { db } from '../src/lib/prisma/db.ts';

async function seedAdmin() {
  const email = 'admin@coolpark.pl';
  const password = 'AdminPassword123!';
  const name = 'Główny Administrator';

  console.log(`Tworzenie/aktualizacja konta administratora: ${email}...`);

  const passwordHash = await hashPassword(password);

  const existing = await db.orm.public.User.where({ email }).first();

  if (existing) {
    await db.orm.public.User.where({ id: existing.id }).update({
      password: passwordHash,
      isAdmin: true,
      emailVerified: true,
      role: 'admin',
    });
    console.log(`Konto ${email} już istniało i zostało zaktualizowane.`);
  } else {
    await db.orm.public.User.create({
      email,
      password: passwordHash,
      name,
      isAdmin: true,
      emailVerified: true,
      role: 'admin',
    });
    console.log(`Utworzono nowe konto administratora: ${email}`);
  }

  console.log('---');
  console.log('LOGIN: ' + email);
  console.log('HASŁO: ' + password);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Błąd podczas tworzenia admina:', err);
  process.exit(1);
});
