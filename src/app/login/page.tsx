'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          setError('Adres e-mail nie został jeszcze zweryfikowany. Sprawdź skrzynkę odbiorczą.');
        } else if (data.error === 'INVALID_CREDENTIALS') {
          setError('Nieprawidłowy adres e-mail lub hasło.');
        } else if (data.error === 'RATE_LIMITED') {
          setError('Zbyt wiele prób logowania. Spróbuj ponownie później.');
        } else {
          setError(data.message || 'Wystąpił błąd podczas logowania.');
        }
        return;
      }

      router.refresh();
      router.push('/');
    } catch {
      setError('Błąd połączenia z serwerem. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Zaloguj się do CoolPark
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Nie masz jeszcze konta?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Zarejestruj się bezpłatnie
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Adres e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="twoj@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Hasło
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
