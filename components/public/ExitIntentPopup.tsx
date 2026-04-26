'use client';

/**
 * ExitIntentPopup — triggers when user moves mouse toward browser top.
 * 0.26: Build exit intent popup ("Get 3 free AI designs")
 * Stored in localStorage so it only shows once per session.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'decoqo_exit_popup_shown';

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already shown this session
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch { /* ignore */ }

    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered || dismissed) return;
      // Trigger when mouse moves to top 10px of viewport
      if (e.clientY <= 10) {
        triggered = true;
        setVisible(true);
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
      }
    };

    // Delay attaching listener to avoid immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-[201] w-full max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-3xl p-8 shadow-2xl',
          'animate-scale-in',
        )}
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 7%), hsl(0 0% 4%))',
          border: '1px solid hsl(45 65% 52% / 0.3)',
          boxShadow: '0 0 80px hsl(45 65% 52% / 0.15)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Get free AI designs"
      >
        {/* Close */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--gold-gradient)' }}
        />

        <div className="relative z-10 text-center">
          {/* Icon */}
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'hsl(40 45% 55% / 0.15)', border: '1px solid hsl(40 45% 55% / 0.3)' }}
          >
            <Sparkles className="h-8 w-8 text-accent" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-white mb-2">
            Wait — Get 3 Free AI Designs
          </h2>
          <p className="text-white/60 font-sans text-sm mb-6 leading-relaxed">
            Before you go — let our AI generate 3 photorealistic design concepts for your space.
            Completely free. No credit card required.
          </p>

          <Link
            href="/register/customer"
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:scale-[1.02] w-full mb-3"
            style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
          >
            <Sparkles className="h-5 w-5" />
            Get My Free Designs
            <ArrowRight className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-white/30 hover:text-white/50 transition-colors font-sans"
          >
            No thanks, I&apos;ll pass on free designs
          </button>
        </div>
      </div>
    </>
  );
}
