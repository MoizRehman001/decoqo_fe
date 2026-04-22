'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CreditCard, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';

function useParallax(speed = 0.4) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.scrollY * speed);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return offset;
}

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const parallaxOffset = useParallax(0.4);
  const [counters, setCounters] = useState({ a: 0, b: 0, c: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { a: 98, b: 4, c: 48 };
    const duration = 2000;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCounters({
        a: Math.round(targets.a * ease),
        b: Math.round(targets.b * ease),
        c: Math.round(targets.c * ease),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsVisible]);

  const heroSrc = mounted && !isDark ? '/home_image_white.png' : '/hero-interior.jpg';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden story-chapter">
      {/* Parallax background */}
      <div className="absolute inset-0">
        <Image
          src={heroSrc}
          alt="Premium interior design showcase"
          fill
          priority
          className="object-cover will-change-transform"
          style={{
            transform: `translateY(${parallaxOffset}px) scale(1.15)`,
            filter: 'saturate(1.1) contrast(1.05)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, hsl(30 10% 12% / 0.3) 0%, hsl(30 10% 12% / 0.45) 40%, hsl(30 10% 12% / 0.85) 100%)',
          }}
        />
        {/* Ambient gold glow */}
        <div
          className="absolute bottom-0 left-1/4 w-[28rem] h-[28rem] rounded-full opacity-[0.12] blur-3xl"
          style={{ background: 'hsl(40 50% 70%)' }}
        />
        <div
          className="absolute top-1/4 right-1/6 w-72 h-72 rounded-full opacity-[0.08] blur-3xl"
          style={{ background: 'hsl(35 30% 90%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="glass-pill inline-flex items-center gap-2.5 mb-10 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90 tracking-wide font-sans">
                Escrow · Trust-First · Execution
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold leading-[1.08] mb-8 animate-fade-up text-white"
              style={{ animationDelay: '0.1s' }}
            >
              The Operating Layer for{' '}
              <span className="gold-text italic">Interior Execution</span>
            </h1>

            <p
              className="text-lg sm:text-xl leading-relaxed mb-12 max-w-xl animate-fade-up text-white/70 font-sans"
              style={{ animationDelay: '0.2s' }}
            >
              Design locked. Scope locked. Money locked.
              <br />
              Every project governed end-to-end for Mumbai, Bengaluru, Delhi NCR and tier-2 India.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <Link
                href="/register/customer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'var(--gold-gradient)',
                  color: 'hsl(0 0% 4%)',
                  boxShadow: '0 8px 32px hsl(45 65% 52% / 0.4)',
                }}
              >
                Get Early Access
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white glass-card transition-all duration-300 hover:bg-white/10"
              >
                See How It Works ↓
              </Link>
            </div>

            {/* Animated stats */}
            <div
              ref={statsRef}
              className="flex items-center gap-6 sm:gap-10 mt-16 animate-fade-up"
              style={{ animationDelay: '0.5s' }}
            >
              {[
                { value: `${counters.a}%`, label: 'Escrow Compliance' },
                { value: `${counters.b}%`, label: 'Dispute Rate' },
                { value: `${counters.c}h`, label: 'Avg Payout' },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-10 bg-white/15" />}
                  <div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold gold-text">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-white/45 mt-0.5 font-sans">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating cards */}
          <div
            className="hidden lg:block relative animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=85&auto=format&fit=crop"
                  alt="Luxury living room interior"
                  width={600}
                  height={500}
                  className="w-full h-[500px] object-cover"
                  priority
                />
              </div>

              {/* Floating card 1 — Design Locked */}
              <div
                className="absolute -left-8 top-12 glass-card rounded-2xl p-4 flex items-center gap-3 animate-float shadow-2xl"
                style={{ animationDelay: '0s' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'hsl(142 71% 45% / 0.15)' }}
                >
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white font-sans">Design Locked</div>
                  <div className="text-[11px] text-white/50 font-sans">Design #3 · Apr 12</div>
                </div>
              </div>

              {/* Floating card 2 — Escrow Funded */}
              <div
                className="absolute -right-6 bottom-20 glass-card rounded-2xl p-4 flex items-center gap-3 animate-float shadow-2xl"
                style={{ animationDelay: '1s' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'hsl(38 75% 55% / 0.15)' }}
                >
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white font-sans">Escrow Funded</div>
                  <div className="text-[11px] text-white/50 font-sans">₹38,000 · Milestone 1</div>
                </div>
              </div>

              {/* AI badge */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-5 glass-pill flex items-center gap-2 animate-float shadow-xl"
                style={{ animationDelay: '2s' }}
              >
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-white/80 font-sans">Verified Design</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-7 h-11 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5 backdrop-blur-sm">
          <div
            className="w-1.5 h-3 rounded-full animate-bounce"
            style={{ background: 'linear-gradient(180deg, hsl(45 70% 80%), hsl(38 55% 55%))' }}
          />
        </div>
      </div>
    </section>
  );
}
