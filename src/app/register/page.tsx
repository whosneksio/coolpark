'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() ? name.trim() : undefined,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'EMAIL_TAKEN') {
          setError('Podany adres e-mail jest już zarejestrowany.');
        } else if (data.error === 'INVALID_BODY') {
          setError('Wypełnij poprawnie wszystkie pola (hasło min. 8 znaków).');
        } else if (data.error === 'RATE_LIMITED') {
          setError('Zbyt wiele prób rejestracji. Spróbuj ponownie później.');
        } else {
          setError(data.message || 'Wystąpił błąd podczas rejestracji.');
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('Błąd połączenia z serwerem. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            ✓
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Konto zostało utworzone!
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Wysłaliśmy link weryfikacyjny na adres <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{email}</strong>.
            Kliknij w link w wiadomości e-mail, aby aktywować konto przed pierwszym logowaniem.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Przejdź do logowania
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Załóż konto w CoolPark
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Masz już konto?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Zaloguj się
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
              Imię i nazwisko <span className="text-xs text-zinc-400">(opcjonalnie)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Jan Kowalski"
            />
          </div>

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
              Hasło (min. 8 znaków)
            </label>
            <input
              type="password"
              required
              minLength={8}
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
            {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
