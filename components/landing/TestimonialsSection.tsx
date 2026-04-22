'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Testimonial {
  avatar: string;
  name: string;
  location: string;
  role: string;
  quote: string;
  saving?: string;
  accentColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    avatar: '/avatar-customer.png',
    name: 'Priya Sharma',
    location: 'Bengaluru',
    role: 'Homeowner',
    quote:
      'Saved ₹3.2L vs my initial estimate. Anonymous bidding meant genuine competition — vendors couldn\'t game the system. My kitchen looks exactly like the AI design. Decoqo is the only way I\'d ever do interiors again.',
    saving: 'Saved ₹3.2L',
    accentColor: 'hsl(217 65% 60%)',
  },
  {
    avatar: '/avatar-vendor.png',
    name: 'Rajesh Kumar',
    location: 'Mumbai',
    role: 'Interior Contractor',
    quote:
      'First time in my 12-year career I got paid on time, every single milestone. No chasing clients, no disputes about scope. The BOQ lock means what we agreed is what we deliver. Decoqo changed how I run my business.',
    accentColor: 'hsl(142 71% 45%)',
  },
  {
    avatar: '/avatar-host.png',
    name: 'Ananya Iyer',
    location: 'Hyderabad',
    role: 'Property Host',
    quote:
      'The AI designs helped me visualize the space before spending a single rupee. I could show my family exactly what the apartment would look like. The whole process felt premium — like having a personal design concierge.',
    accentColor: 'hsl(40 45% 55%)',
  },
];

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'hsl(40 45% 55%)' }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
  index,
  visible,
}: {
  t: Testimonial;
  index: number;
  visible: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-3xl p-7 flex flex-col gap-5 group transition-all duration-700 hover:-translate-y-1 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Gold quote mark */}
      <div
        className="font-serif text-6xl leading-none select-none"
        style={{ color: t.accentColor, opacity: 0.35 }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      {/* Quote */}
      <blockquote className="text-foreground/80 font-sans text-sm leading-relaxed flex-1 -mt-6">
        {t.quote}
      </blockquote>

      {/* Saving badge */}
      {t.saving && (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-sans self-start"
          style={{
            background: `${t.accentColor}15`,
            color: t.accentColor,
            border: `1px solid ${t.accentColor}30`,
          }}
        >
          💰 {t.saving}
        </div>
      )}

      {/* Divider */}
      <div className="gold-line" />

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
          style={{ outline: `2px solid ${t.accentColor}`, outlineOffset: '2px' }}
        >
          <Image src={t.avatar} alt={t.name} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground font-sans text-sm truncate">{t.name}</div>
          <div className="text-xs text-muted-foreground font-sans">
            {t.role} · {t.location}
          </div>
        </div>
        <StarRating />
      </div>
    </div>
  );
}

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

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      className="py-24 sm:py-32 story-chapter relative overflow-hidden"
      style={{ background: 'hsl(var(--secondary) / 0.4)' }}
    >
      {/* Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(45 65% 52% / 0.06), transparent 60%)',
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
              Real Stories
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Trusted by{' '}
            <span className="gold-text italic">Real People</span>
          </h2>
          <p className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto">
            Homeowners, contractors, and hosts — all winning on Decoqo.
          </p>
        </div>

        {/* Desktop: 3-col grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} visible={isVisible} />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-6 px-6">
          <div className="flex gap-4 w-max pb-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="w-[85vw] max-w-sm flex-shrink-0">
                <TestimonialCard t={t} index={i} visible={isVisible} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom aggregate rating */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-14 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-3 glass-card rounded-2xl px-6 py-4">
            <div className="flex -space-x-2">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-background"
                >
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="pl-2">
              <div className="flex items-center gap-2">
                <StarRating />
                <span className="font-serif font-bold text-foreground">4.8</span>
              </div>
              <div className="text-xs text-muted-foreground font-sans">from 2,400+ projects</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
