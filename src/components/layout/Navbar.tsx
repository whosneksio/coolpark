'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin?: boolean;
}

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
      router.push('/login');
    } catch (err) {
      console.error('Błąd wylogowania:', err);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm shadow-blue-500/20">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cool<span className="text-blue-600">Park</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50">
              Parkingi
            </Link>
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              >
                Panel Admina
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-sm text-zinc-600 dark:text-zinc-400">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Wyloguj się
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                Logowanie
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Rejestracja
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
