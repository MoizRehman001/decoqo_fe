'use client';

/**
 * SmartCtaBanner — slide-up CTA banner that triggers after 30 seconds.
 * 0.27: Build smart CTA slide-up banner (triggers after 30s)
 * Also serves as sticky mobile CTA bar (0.31).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'decoqo_cta_banner_dismissed';

export function SmartCtaBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch { /* ignore */ }

    const timer = setTimeout(() => {
      if (!dismissed) setVisible(true);
    }, 30_000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[100]',
        'transition-transform duration-500 ease-out',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {/* Desktop banner */}
      <div
        className="hidden sm:flex items-center justify-between gap-4 px-6 py-4 shadow-2xl"
        style={{
          background: 'linear-gradient(90deg, hsl(0 0% 6%), hsl(0 0% 4%))',
          borderTop: '1px solid hsl(45 65% 52% / 0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'hsl(40 45% 55% / 0.15)' }}
          >
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white font-sans">
              Get 3 free AI designs for your space
            </p>
            <p className="text-xs text-white/50 font-sans">
              Anonymous bids from verified vendors · Escrow-backed execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/register/customer"
            onClick={handleDismiss}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
          >
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div
        className="sm:hidden flex items-center gap-3 px-4 py-3 shadow-2xl"
        style={{
          background: 'linear-gradient(90deg, hsl(0 0% 6%), hsl(0 0% 4%))',
          borderTop: '1px solid hsl(45 65% 52% / 0.25)',
        }}
      >
        <Link
          href="/register/customer"
          onClick={handleDismiss}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
          style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
        >
          <Sparkles className="h-4 w-4" />
          Get 3 Free AI Designs
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/60"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
