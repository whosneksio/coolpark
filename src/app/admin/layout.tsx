import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    redirect('/login');
  }

  if (!user.isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-red-950 dark:text-red-200">Brak uprawnień</h2>
          <p className="mt-2 text-sm text-red-800 dark:text-red-300">
            Dostęp do tej sekcji mają wyłącznie administratorzy systemu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Panel Administratora
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Zarządzaj parkingami, siatką miejsc i ich dostępnością
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Zalogowany jako Admin: {user.email}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
