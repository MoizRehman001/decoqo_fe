'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, isVisible };
}

export function CTASection() {
  const { ref, isVisible } = useScrollReveal();
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');

  return (
    <section className="py-28 relative overflow-hidden story-chapter">
      {/* BG image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600210491892-03d54730d73e?w=1600&q=80&auto=format&fit=crop"
          alt="Luxury interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-black/60" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Left */}
          <div>
            <div className="glass-pill inline-flex items-center gap-2 mb-6">
              <span className="text-sm font-semibold font-sans tracking-widest uppercase text-accent">
                Early Access
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white text-balance leading-tight">
              Be Part of the{' '}
              <span className="gold-text italic">Trust Revolution.</span>
            </h2>
            <p className="text-white/60 font-sans text-lg mt-5 leading-relaxed max-w-lg">
              Join customers and vendors building India&apos;s most reliable interior execution platform.
            </p>
            <div className="flex flex-wrap gap-4 mt-8 text-sm font-sans text-white/50">
              <span>✓ No spam, ever</span>
              <span>✓ Personal outreach</span>
              <span>✓ Early access only</span>
            </div>
          </div>

          {/* Right: Form card */}
          <div className="glass-card rounded-2xl p-8 max-w-md lg:ml-auto">
            {/* Role switcher */}
            <div className="flex gap-2 mb-8 p-1 rounded-xl bg-card/30">
              {(['customer', 'vendor'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-sans font-semibold transition-all duration-300 ${
                    role === r
                      ? 'shadow-md text-[hsl(0_0%_4%)]'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                  style={role === r ? { background: 'var(--gold-gradient)' } : undefined}
                >
                  {r === 'customer' ? '🏠 Customer' : '🔨 Vendor'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-sans font-semibold text-white/60 mb-1.5 block">Full Name</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/50 transition"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-white/60 mb-1.5 block">Email</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/50 transition"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-white/60 mb-1.5 block">City</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/50 transition"
                  placeholder="Mumbai, Bengaluru, Delhi…"
                />
              </div>
              <Link
                href={role === 'customer' ? '/register/customer' : '/register/vendor'}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
              >
                Request Early Access <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-white/30 font-sans text-center mt-3">
                By submitting, you agree to our Privacy Policy and Terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
