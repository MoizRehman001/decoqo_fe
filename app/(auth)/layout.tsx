/**
 * Auth layout — premium split layout.
 * Left: brand panel (dark, gold gradient, logo, tagline, trust badges)
 * Right: form panel (white/card, centered)
 * Mobile: only right panel
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Shield, Lock, CheckCircle, Gem } from 'lucide-react';

// ---------------------------------------------------------------------------
// Trust Badges
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  {
    icon: Shield,
    title: 'Escrow Protected',
    description: 'Funds held securely until milestones are approved',
  },
  {
    icon: Lock,
    title: 'BOQ Locked',
    description: 'Bill of quantities locked before work begins',
  },
  {
    icon: CheckCircle,
    title: 'Verified Vendors',
    description: 'All vendors KYC-verified and background-checked',
  },
] as const;

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const STATS = [
  { value: '2,400+', label: 'Projects Completed' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '₹120Cr+', label: 'Escrow Managed' },
] as const;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left Brand Panel (hidden on mobile) ─────────────────────────── */}
      <aside
        className="hidden lg:flex lg:w-[480px] lg:shrink-0 lg:flex-col"
        aria-label="Decoqo brand panel"
        style={{
          background: 'linear-gradient(160deg, hsl(0 0% 5%) 0%, hsl(0 0% 8%) 50%, hsl(0 0% 4%) 100%)',
        }}
      >
        <div className="flex flex-1 flex-col px-10 py-12">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Decoqo — go to homepage"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
              <Gem className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-white">
              Decoqo
            </span>
          </Link>

          {/* Tagline */}
          <div className="mt-16 flex-1">
            <h2 className="font-serif text-4xl font-semibold leading-tight text-white">
              Design.{' '}
              <span
                className="gold-text animate-gold-sweep"
                style={{
                  background: 'linear-gradient(105deg, hsl(38 40% 45%) 0%, hsl(42 50% 60%) 30%, hsl(45 55% 75%) 50%, hsl(42 50% 60%) 70%, hsl(38 40% 45%) 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Lock.
              </span>
              <br />
              Execute.{' '}
              <span
                style={{
                  background: 'linear-gradient(105deg, hsl(38 40% 45%) 0%, hsl(42 50% 60%) 30%, hsl(45 55% 75%) 50%, hsl(42 50% 60%) 70%, hsl(38 40% 45%) 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Trust.
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              India&apos;s first escrow-backed interior design marketplace. Your dream space, delivered with complete transparency.
            </p>

            {/* Gold divider */}
            <div
              className="my-8 h-px w-16"
              style={{
                background: 'linear-gradient(90deg, hsl(38 60% 55% / 0.8), transparent)',
              }}
              aria-hidden="true"
            />

            {/* Trust Badges */}
            <div className="space-y-5">
              {TRUST_BADGES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20">
                    <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs text-white/50">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-auto">
            <div
              className="h-px w-full"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(38 60% 55% / 0.3), transparent)',
              }}
              aria-hidden="true"
            />
            <div className="mt-6 grid grid-cols-3 gap-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="font-serif text-xl font-semibold text-accent">{value}</p>
                  <p className="mt-0.5 text-xs text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right Form Panel ─────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col bg-background">
        {/* Mobile header */}
        <header className="flex h-16 items-center border-b border-border px-6 lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Decoqo — go to homepage"
          >
            <Gem className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-serif text-xl font-semibold text-foreground">
              Decoqo
            </span>
          </Link>
        </header>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Decoqo. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
