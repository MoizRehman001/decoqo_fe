'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { BadgeCheck, Eye, Lock, Scale, Shield } from 'lucide-react';

interface TrustPillar {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accentColor: string;
}

const PILLARS: TrustPillar[] = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Escrow Protection',
    desc: 'Funds held by Decoqo, released only on verified milestone completion.',
    accentColor: 'hsl(40 45% 55%)',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'BOQ Lock',
    desc: 'Scope of work is frozen at signing. No surprise additions, ever.',
    accentColor: 'hsl(217 65% 60%)',
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'Anonymous Bidding',
    desc: 'Vendor identities masked until deal is signed. Pure merit competition.',
    accentColor: 'hsl(142 71% 45%)',
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'Dispute Resolution',
    desc: '48-hour SLA with neutral arbitration. Fair outcomes guaranteed.',
    accentColor: 'hsl(280 60% 65%)',
  },
  {
    icon: <BadgeCheck className="w-5 h-5" />,
    title: 'Verified KYC',
    desc: 'Every vendor is identity-verified, GST-registered, and background-checked.',
    accentColor: 'hsl(0 72% 60%)',
  },
];

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

export function TrustSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      className="py-24 sm:py-32 story-chapter relative overflow-hidden"
      style={{ background: 'hsl(var(--card) / 0.5)' }}
    >
      {/* Dark glass ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, hsl(45 65% 52% / 0.07), transparent 70%)',
        }}
      />

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
              Built on Trust
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Your Money is{' '}
            <span className="gold-text italic">Always Safe</span>
          </h2>
          <p className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto">
            Five layers of protection built into every project. Not a promise — a system.
          </p>
        </div>

        {/* Feature hero + pillars grid */}
        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Left: Trust avatar feature card */}
          <div
            className={`transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden">
              {/* Gold ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 60% at 50% 30%, hsl(45 65% 52% / 0.12), transparent 70%)',
                }}
              />

              <div className="relative z-10">
                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div
                    className="absolute inset-0 rounded-full animate-pulse-glow"
                    style={{
                      background:
                        'radial-gradient(circle, hsl(45 65% 52% / 0.25), transparent 70%)',
                    }}
                  />
                  <div className="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-accent/40 ring-offset-2 ring-offset-background">
                    <Image
                      src="/avatar-trust.png"
                      alt="Decoqo Trust & Escrow"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Verified badge */}
                  <div
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--gold-gradient)' }}
                  >
                    <Shield className="w-4 h-4 text-[hsl(0_0%_4%)]" />
                  </div>
                </div>

                <div className="font-serif text-2xl font-bold text-foreground mb-1">
                  ₹180Cr+ Protected
                </div>
                <div className="text-sm text-muted-foreground font-sans mb-6">
                  Across 2,400+ projects nationwide
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { val: '98%', label: 'Dispute-Free' },
                    { val: '48h', label: 'Resolution SLA' },
                    { val: '100%', label: 'KYC Verified' },
                    { val: '₹0', label: 'Vendor Fraud' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="p-3 rounded-xl"
                      style={{ background: 'hsl(var(--card) / 0.6)', border: '1px solid hsl(var(--border))' }}
                    >
                      <div className="font-serif font-bold text-lg gold-text">{s.val}</div>
                      <div className="text-[11px] text-muted-foreground font-sans">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="gold-line" />
                <p className="text-xs text-muted-foreground font-sans mt-4 leading-relaxed">
                  Decoqo acts as a neutral escrow agent. Funds are held in a regulated account and released only on verified completion.
                </p>
              </div>
            </div>
          </div>

          {/* Right: 5 trust pillars */}
          <div className="grid sm:grid-cols-2 gap-4">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className={`ivory-card rounded-2xl p-6 group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${pillar.accentColor}15`,
                    color: pillar.accentColor,
                    border: `1px solid ${pillar.accentColor}25`,
                  }}
                >
                  {pillar.icon}
                </div>
                <h3 className="font-serif font-bold text-foreground text-lg mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{pillar.desc}</p>

                {/* Bottom accent line */}
                <div
                  className="mt-4 h-0.5 rounded-full w-12 transition-all duration-300 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, ${pillar.accentColor}, transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
