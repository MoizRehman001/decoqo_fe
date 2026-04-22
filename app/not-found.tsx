import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-4">
      <div className="text-center">
        <p className="text-base font-semibold text-[#C9A84C]">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-[#78716C]">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#B8860B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C] transition-colors"
          >
            Go back home
          </Link>
          <Link
            href="/contact"
            className="text-sm font-semibold text-[#1C1917] hover:text-[#C9A84C] transition-colors"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
