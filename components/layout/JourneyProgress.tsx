'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CHAPTERS = [
  { to: '/', label: 'Welcome' },
  { to: '/how-it-works', label: 'Process' },
  { to: '/explore', label: 'Explore' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/register/customer', label: 'Start' },
];

/**
 * Sticky global journey progress bar.
 * - Top thin gold-gradient line that fills based on scroll
 * - Glass capsule with chapter dots on desktop
 */
const JourneyProgress = () => {
  const pathname = usePathname();
  const [scrollPct, setScrollPct] = useState(0);

  const stepIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => c.to === pathname),
  );
  const total = CHAPTERS.length;

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setScrollPct(Math.min(1, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const fill = ((stepIndex + scrollPct) / total) * 100;

  return (
    <>
      {/* Top gold progress line */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-foreground/5 pointer-events-none">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{
            width: `${fill}%`,
            background: 'var(--gold-gradient)',
            boxShadow: '0 0 12px hsl(45 65% 52% / 0.6)',
          }}
        />
      </div>

      {/* Floating chapter capsule (desktop) */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3">
        <div className="glass-card rounded-full px-2 py-3 flex flex-col items-center gap-3">
          {CHAPTERS.map((c, i) => {
            const active = i === stepIndex;
            const completed = i < stepIndex;
            return (
              <Link
                key={c.to}
                href={c.to}
                className="group relative flex items-center justify-center"
                aria-label={`Chapter ${i + 1}: ${c.label}`}
              >
                <span
                  className={`block rounded-full transition-all duration-500 ${
                    active ? 'w-2.5 h-8' : completed ? 'w-2 h-2' : 'w-1.5 h-1.5'
                  }`}
                  style={{
                    background: active
                      ? 'var(--gold-gradient)'
                      : completed
                        ? 'hsl(45 50% 55% / 0.7)'
                        : 'hsl(var(--foreground) / 0.2)',
                    boxShadow: active ? '0 0 14px hsl(45 65% 52% / 0.6)' : 'none',
                  }}
                />
                <span className="absolute right-full mr-3 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] font-sans text-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.label}
                </span>
              </Link>
            );
          })}
        </div>
        <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-foreground/40">
          {stepIndex + 1}/{total}
        </span>
      </div>
    </>
  );
};

export default JourneyProgress;
