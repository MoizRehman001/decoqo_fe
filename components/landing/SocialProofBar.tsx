'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  decimals?: boolean;
}

const STATS: Stat[] = [
  { value: 2400, suffix: '+', label: 'Projects Delivered' },
  { value: 180, prefix: '₹', suffix: 'Cr+', label: 'Secured in Escrow' },
  { value: 4.8, suffix: '★', label: 'Average Rating', decimals: true },
  { value: 98, suffix: '%', label: 'Dispute-Free' },
];

function useCountUp(target: number, decimals: boolean, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(decimals ? Math.round(target * ease * 10) / 10 : Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, decimals]);
  return val;
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, stat.decimals ?? false, active);
  const display = stat.decimals ? count.toFixed(1) : count.toLocaleString('en-IN');

  return (
    <div className="flex flex-col items-center gap-1 min-w-[140px] px-6">
      <div className="text-2xl sm:text-3xl font-serif font-bold gold-text tabular-nums">
        {stat.prefix ?? ''}{display}{stat.suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-sans font-medium tracking-wide whitespace-nowrap">
        {stat.label}
      </div>
    </div>
  );
}

export function SocialProofBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative z-10 py-5 border-y border-accent/20 overflow-hidden"
      style={{ background: 'hsl(var(--card) / 0.6)', backdropFilter: 'blur(20px)' }}
    >
      {/* Subtle gold ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 100% at 50% 50%, hsl(45 65% 52% / 0.05), transparent 70%)',
        }}
      />

      {/* Desktop: flex row */}
      <div className="hidden sm:flex items-center justify-center gap-0 relative z-10">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center">
            {i > 0 && <div className="w-px h-10 bg-accent/20 mx-2" />}
            <StatItem stat={stat} active={active} />
          </div>
        ))}
      </div>

      {/* Mobile: horizontal scroll ticker */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide relative z-10">
        <div className="flex items-center gap-0 w-max px-6">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && <div className="w-px h-8 bg-accent/20 mx-2" />}
              <StatItem stat={stat} active={active} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
