'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {status === 'loading' && (
          <div>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Weryfikowanie adresu e-mail...
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              ✓
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Adres e-mail zweryfikowany!
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Twoje konto jest teraz aktywne. Możesz się zalogować.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Przejdź do logowania
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              ✕
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Nieprawidłowy lub wygasły link
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Link weryfikacyjny wygasł lub został już użyty.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex w-full justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Wróć do logowania
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Ładowanie...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
