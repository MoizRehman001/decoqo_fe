'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-4">
      <div className="text-center">
        <p className="text-base font-semibold text-[#DC2626]">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">
          An error occurred
        </h1>
        <p className="mt-6 text-base leading-7 text-[#78716C]">
          We&apos;re sorry, something went wrong on our end. Please try again.
        </p>
        {error.digest && (
          <p className="mt-2 text-sm text-[#A8A29E]">Error ID: {error.digest}</p>
        )}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={reset}
            className="rounded-md bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#B8860B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C] transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="text-sm font-semibold text-[#1C1917] hover:text-[#C9A84C] transition-colors"
          >
            Go back home <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
