'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export function HowItWorksHero() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(45 65% 52% / 0.08), transparent 60%)',
        }}
      />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="glass-pill inline-flex items-center gap-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">
            The Platform
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
          Every Rupee Protected.{' '}
          <span className="gold-text italic">Every Project Governed.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
          Decoqo is not just a marketplace — it&apos;s an operating layer for interior execution.
          Design locked. Scope locked. Money locked. From first sketch to final payment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register/customer"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'var(--gold-gradient)',
              color: 'hsl(0 0% 4%)',
              boxShadow: '0 8px 32px hsl(45 65% 52% / 0.35)',
            }}
          >
            Start Your Project <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-semibold text-foreground hover:bg-muted/30 transition-all duration-300"
          >
            <Play className="h-4 w-4 text-accent" />
            See Live Projects
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: '₹180Cr+', label: 'Escrow Protected' },
            { value: '2,400+', label: 'Projects Completed' },
            { value: '98%', label: 'Dispute-Free Rate' },
            { value: '48h', label: 'Dispute Resolution' },
          ].map((stat) => (
            <div key={stat.label} className="ivory-card rounded-2xl p-5 text-center">
              <p className="font-serif text-2xl font-bold gold-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-sans mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
