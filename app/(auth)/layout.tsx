/**
 * Auth layout — centered card, no sidebar.
 * Wraps all authentication pages: login, register, verify.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* Minimal header */}
      <header className="flex h-16 items-center border-b border-[#E7E5E4] px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[#1C1917]"
          aria-label="Decoqo — go to homepage"
        >
          <span className="text-[#C9A84C]">Deco</span>qo
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-[#E7E5E4] bg-white p-8 shadow-md">
          {children}
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="py-4 text-center text-xs text-[#A8A29E]">
        &copy; {new Date().getFullYear()} Decoqo. All rights reserved.
      </footer>
    </div>
  );
}
