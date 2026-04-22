'use client';

import { useEffect, useRef, useState } from 'react';
import { Home, Sparkles, Users, Shield } from 'lucide-react';

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  desc: string;
  mockupLines: string[];
  accentColor: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    icon: <Home className="w-6 h-6" />,
    title: 'Define Your Space',
    subtitle: 'Upload floor plan, describe your vision',
    desc: 'Tell us about your space — dimensions, style preferences, budget range. Upload photos or a floor plan. Our AI understands context, not just keywords.',
    mockupLines: ['Floor Plan Uploaded ✓', 'Style: Contemporary', 'Budget: ₹8–12L', 'City: Bengaluru'],
    accentColor: 'hsl(217 65% 60%)',
  },
  {
    number: '02',
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI Designs in Minutes',
    subtitle: 'Get 2–3 photorealistic concepts instantly',
    desc: 'Our AI generates photorealistic design concepts tailored to your space and budget. Review, refine, and lock the design you love — before a single rupee is spent.',
    mockupLines: ['Design A: Modern Minimal', 'Design B: Warm Earthy', 'Design C: Luxury Dark', '→ Design B Locked ✓'],
    accentColor: 'hsl(40 45% 55%)',
  },
  {
    number: '03',
    icon: <Users className="w-6 h-6" />,
    title: 'Anonymous Bids',
    subtitle: 'Verified vendors compete on merit',
    desc: 'Your project goes live to our verified vendor network. They bid anonymously — no names, no relationships, just competitive pricing and transparent BOQs.',
    mockupLines: ['Vendor A: ₹9.2L · 6 weeks', 'Vendor B: ₹8.8L · 7 weeks', 'Vendor C: ₹10.1L · 5 weeks', '7 bids received'],
    accentColor: 'hsl(142 71% 45%)',
  },
  {
    number: '04',
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure Execution',
    subtitle: 'Escrow-backed milestones, dispute resolution',
    desc: 'Funds are held in escrow and released only when milestones are verified. Scope is locked. Contacts are masked until deal is signed. Disputes resolved in 48 hours.',
    mockupLines: ['Milestone 1: ₹2.2L Released ✓', 'Milestone 2: In Progress…', 'Escrow Balance: ₹6.6L', 'Dispute Rate: 2%'],
    accentColor: 'hsl(0 72% 60%)',
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

function StepCard({ step, index, isLeft, visible }: {
  step: Step;
  index: number;
  isLeft: boolean;
  visible: boolean;
}) {
  return (
    <div
      className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Text side */}
      <div className={isLeft ? 'lg:order-1' : 'lg:order-2'}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${step.accentColor}18`, color: step.accentColor, border: `1px solid ${step.accentColor}30` }}
          >
            {step.icon}
          </div>
          <span
            className="text-xs font-bold font-sans uppercase tracking-widest"
            style={{ color: step.accentColor }}
          >
            Step {step.number}
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          {step.title}
        </h3>
        <p
          className="text-sm font-sans font-semibold mb-4"
          style={{ color: step.accentColor }}
        >
          {step.subtitle}
        </p>
        <p className="text-muted-foreground font-sans leading-relaxed">
          {step.desc}
        </p>
      </div>

      {/* Mockup card side */}
      <div className={isLeft ? 'lg:order-2' : 'lg:order-1'}>
        <div className="neu-card-3d rounded-2xl p-6 max-w-sm mx-auto lg:mx-0">
          {/* Mockup header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            </div>
            <div
              className="flex-1 h-5 rounded-md text-[10px] font-sans font-medium flex items-center px-2"
              style={{ background: `${step.accentColor}12`, color: step.accentColor }}
            >
              decoqo.com · {step.title}
            </div>
          </div>

          {/* Mockup content lines */}
          <div className="space-y-3">
            {step.mockupLines.map((line, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: `${step.accentColor}08`, border: `1px solid ${step.accentColor}15` }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: step.accentColor }}
                />
                <span className="text-sm font-sans text-foreground/80">{line}</span>
              </div>
            ))}
          </div>

          {/* Bottom accent */}
          <div
            className="mt-5 h-1 rounded-full"
            style={{ background: `linear-gradient(90deg, ${step.accentColor}, transparent)` }}
          />
        </div>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 sm:py-32 story-chapter bg-background relative overflow-hidden">
      {/* Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 100%, hsl(45 65% 52% / 0.05), transparent 60%)',
        }}
      />

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        {/* Header */}
        <div
          className={`text-center mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
              The Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            How Decoqo{' '}
            <span className="gold-text italic">Works</span>
          </h2>
          <p className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto">
            Four steps from idea to execution. Every step governed, every rupee protected.
          </p>
        </div>

        {/* Steps with animated gold connector */}
        <div className="relative">
          {/* Vertical gold line — desktop only */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px hidden lg:block transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background:
                'linear-gradient(180deg, transparent, hsl(45 65% 52% / 0.4) 20%, hsl(45 65% 52% / 0.4) 80%, transparent)',
            }}
          />

          <div className="space-y-20 lg:space-y-28">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                index={i}
                isLeft={i % 2 === 0}
                visible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
