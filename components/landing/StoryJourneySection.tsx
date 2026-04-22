'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';

interface JourneyStep {
  icon: string;
  title: string;
  desc: string;
}

interface Persona {
  id: string;
  avatar: string;
  name: string;
  role: string;
  tagline: string;
  steps: JourneyStep[];
  cta: string;
  ctaHref: string;
  accentColor: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'customer',
    avatar: '/avatar-customer.png',
    name: 'Priya, Bengaluru',
    role: 'Homeowner',
    tagline: 'From dream kitchen to done — in 6 weeks.',
    steps: [
      { icon: '💬', title: 'Described her dream kitchen', desc: 'Uploaded floor plan, shared inspiration photos' },
      { icon: '✨', title: 'Got 3 AI designs', desc: 'Photorealistic concepts generated in minutes' },
      { icon: '🏷️', title: '7 vendors bid anonymously', desc: 'Genuine competition, no relationship bias' },
      { icon: '🏆', title: 'Chose the best bid', desc: 'Compared BOQ, timeline, and vendor ratings' },
      { icon: '🔒', title: 'Paid via escrow', desc: 'Money held safely, released per milestone' },
      { icon: '🎉', title: 'Kitchen done in 6 weeks', desc: 'On time, on budget, zero disputes' },
    ],
    cta: 'Start Your Project',
    ctaHref: '/register/customer',
    accentColor: 'hsl(217 65% 60%)',
  },
  {
    id: 'vendor',
    avatar: '/avatar-vendor.png',
    name: 'Rajesh, Mumbai',
    role: 'Interior Contractor',
    tagline: 'First time in my career I got paid on time.',
    steps: [
      { icon: '📝', title: 'Joined Decoqo', desc: 'Simple onboarding, no upfront fees' },
      { icon: '✅', title: 'KYC verified', desc: 'Trust badge unlocked, profile goes live' },
      { icon: '🔍', title: 'Browse live projects', desc: 'Filter by city, space type, and budget' },
      { icon: '📊', title: 'Bid anonymously', desc: 'Compete on merit, not on who you know' },
      { icon: '📋', title: 'BOQ locked on win', desc: 'Scope frozen — no scope creep, ever' },
      { icon: '💰', title: 'Got paid per milestone', desc: 'Escrow releases on completion, every time' },
    ],
    cta: 'Join as Vendor',
    ctaHref: '/register/vendor',
    accentColor: 'hsl(142 71% 45%)',
  },
  {
    id: 'concierge',
    avatar: '/avatar-concierge.png',
    name: 'Decoqo Concierge',
    role: 'Your Trust Layer',
    tagline: 'We make sure everyone wins.',
    steps: [
      { icon: '🔐', title: 'Hold escrow', desc: '₹180Cr+ protected across all projects' },
      { icon: '📐', title: 'Lock designs', desc: 'Approved design is immutable — no surprises' },
      { icon: '🎭', title: 'Mask contacts', desc: 'Vendor and customer identities protected until deal' },
      { icon: '⚖️', title: 'Resolve disputes', desc: '48-hour SLA, neutral arbitration panel' },
      { icon: '🛡️', title: 'Ensure everyone wins', desc: 'Fair outcomes, transparent process' },
      { icon: '📈', title: 'Track every milestone', desc: 'Real-time progress, automated releases' },
    ],
    cta: 'See How Trust Works',
    ctaHref: '/how-it-works',
    accentColor: 'hsl(40 45% 55%)',
  },
];

function useScrollReveal(threshold = 0.15) {
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

export function StoryJourneySection() {
  const [active, setActive] = useState(0);
  const { ref, isVisible } = useScrollReveal();
  const safeIndex = Math.min(active, PERSONAS.length - 1);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const persona: Persona = PERSONAS[safeIndex]!;

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden story-chapter bg-background">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(45 65% 52% / 0.06), transparent 60%)',
        }}
      />

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        {/* Section header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
              Three Perspectives
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Every Story Ends with{' '}
            <span className="gold-text italic">Trust</span>
          </h2>
          <p className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto">
            Whether you&apos;re a homeowner, a contractor, or just curious — Decoqo is built for you.
          </p>
        </div>

        {/* Persona tabs */}
        <div
          className={`flex flex-col sm:flex-row gap-3 justify-center mb-12 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 font-sans text-sm font-semibold ${
                active === i
                  ? 'border-accent/60 text-foreground shadow-lg'
                  : 'border-border/50 text-muted-foreground hover:border-accent/30 hover:text-foreground'
              }`}
              style={
                active === i
                  ? { background: 'hsl(var(--card))', boxShadow: `0 0 24px ${p.accentColor}30` }
                  : { background: 'hsl(var(--card) / 0.4)' }
              }
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image src={p.avatar} alt={p.name} fill className="object-cover" />
              </div>
              <div className="text-left">
                <div className={active === i ? 'text-foreground' : 'text-muted-foreground'}>
                  {p.name}
                </div>
                <div className="text-xs font-normal opacity-60">{p.role}</div>
              </div>
              {active === i && (
                <div
                  className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: p.accentColor }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Active story card */}
        <div
          key={persona.id}
          className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ animationDelay: '0.2s' }}
        >
          <div className="glass-card rounded-3xl p-6 sm:p-10 lg:p-12">
            <div className="grid lg:grid-cols-[280px_1fr] gap-10 items-start">
              {/* Left: persona profile */}
              <div className="flex flex-col items-center lg:items-start gap-5">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden"
                    style={{
                      outline: `2px solid ${persona.accentColor}`,
                      outlineOffset: '3px',
                    }}
                  >
                    <Image
                      src={persona.avatar}
                      alt={persona.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: persona.accentColor }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <div className="font-serif text-xl font-bold text-foreground">{persona.name}</div>
                  <div className="text-sm text-muted-foreground font-sans mt-0.5">{persona.role}</div>
                </div>

                <blockquote
                  className="text-sm font-sans italic leading-relaxed text-foreground/70 border-l-2 pl-4 lg:block hidden"
                  style={{ borderColor: persona.accentColor }}
                >
                  &ldquo;{persona.tagline}&rdquo;
                </blockquote>

                {/* Trust badge */}
                <div className="hidden lg:flex items-center gap-3 mt-4 p-4 rounded-2xl border border-accent/20 bg-accent/5 w-full">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src="/avatar-trust.png" alt="Trust guarantee" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-accent font-sans">Decoqo Guarantee</div>
                    <div className="text-xs text-muted-foreground font-sans mt-0.5">₹180Cr+ Protected</div>
                  </div>
                  <Shield className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
                </div>

                <Link
                  href={persona.ctaHref}
                  className="hidden lg:inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] w-full justify-center"
                  style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
                >
                  {persona.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right: journey timeline */}
              <div>
                <blockquote
                  className="text-sm font-sans italic leading-relaxed text-foreground/70 border-l-2 pl-4 mb-8 lg:hidden"
                  style={{ borderColor: persona.accentColor }}
                >
                  &ldquo;{persona.tagline}&rdquo;
                </blockquote>

                <div className="relative">
                  {/* Vertical connector line */}
                  <div
                    className="absolute left-5 top-5 bottom-5 w-px hidden sm:block"
                    style={{
                      background: `linear-gradient(180deg, ${persona.accentColor}60, ${persona.accentColor}10)`,
                    }}
                  />

                  <div className="grid sm:grid-cols-1 gap-4">
                    {persona.steps.map((step, i) => (
                      <div
                        key={step.title}
                        className="flex items-start gap-4 group"
                        style={{
                          animationDelay: `${i * 0.08}s`,
                          opacity: 1,
                        }}
                      >
                        {/* Step number / icon */}
                        <div
                          className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: `${persona.accentColor}18`,
                            border: `1px solid ${persona.accentColor}30`,
                          }}
                        >
                          {step.icon}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 min-w-0 pb-4 border-b border-border/30 last:border-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-bold font-sans uppercase tracking-widest"
                              style={{ color: persona.accentColor }}
                            >
                              Step {i + 1}
                            </span>
                          </div>
                          <div className="font-semibold text-foreground font-sans text-sm mt-0.5">
                            {step.title}
                          </div>
                          <div className="text-xs text-muted-foreground font-sans mt-1 leading-relaxed">
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 lg:hidden">
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-accent/20 bg-accent/5 flex-1">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src="/avatar-trust.png" alt="Trust guarantee" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-accent font-sans">Decoqo Guarantee</div>
                      <div className="text-xs text-muted-foreground font-sans">₹180Cr+ Protected</div>
                    </div>
                  </div>
                  <Link
                    href={persona.ctaHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                    style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
                  >
                    {persona.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
