import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';

export default async function Home() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-6">
        ✨ Witamy w systemie CoolPark
      </div>

      <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-50">
        Inteligentne i wygodne <br className="hidden sm:inline" />
        <span className="text-blue-600">parkowanie miejskie</span>
      </h1>

      <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Wyszukuj wolne miejsca, rezerwuj z wyprzedzeniem i zarządzaj swoimi pojazdami w jednym prostym panelu.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {user ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Witaj ponownie, <strong>{user.name || user.email}</strong>!
            </span>
            <Link
              href="/admin"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Przejdź do panelu
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Rozpocznij teraz
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Zaloguj się
            </Link>
          </>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl w-full text-left">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="text-xl font-bold text-blue-600 mb-2">01. Znajdź miejsce</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Przeglądaj mapy parkingowe i sprawdzaj dostępność wolnych miejsc na bieżąco.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="text-xl font-bold text-blue-600 mb-2">02. Zarezerwuj</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Wybierz ramy czasowe, dodaj swój pojazd i bezpiecznie zarezerwuj miejsce online.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="text-xl font-bold text-blue-600 mb-2">03. Parkuj bez stresu</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Twoje miejsce czeka na Ciebie w wyznaczonych godzinach bez krążenia po parkingu.
          </p>
        </div>
      </div>
    </div>
  );
}
