import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '403 — Access Restricted | Decoqo',
  description: 'You do not have permission to access this page.',
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center animate-page-in">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
          <Lock className="h-10 w-10 text-accent" aria-hidden="true" />
        </div>

        {/* Status code */}
        <p className="mb-2 font-serif text-6xl font-bold text-accent/40">403</p>

        {/* Heading */}
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Access Restricted
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have permission to view this page. This area is restricted to
          authorised users only.
        </p>

        {/* Gold divider */}
        <div
          className="mx-auto my-8 h-px w-24"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(38 60% 55% / 0.6), transparent)',
          }}
          aria-hidden="true"
        />

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/customer/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-xs text-muted-foreground">
          If you believe this is an error, please{' '}
          <Link
            href="/support"
            className="text-accent underline underline-offset-2 hover:text-accent/80"
          >
            contact support
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
