'use client';

import { useEffect, useRef, useState } from 'react';

const customerFeatures = [
  { icon: '🤖', title: 'AI Design Generation', desc: 'Describe your vision. Get 2–3 tailored concepts for your space, style, and budget.' },
  { icon: '👁', title: 'Anonymous Bidding', desc: 'Compare vendors on value, not identity. Select based on scope, timeline, and quality.' },
  { icon: '💳', title: 'Milestone Escrow', desc: 'Pay per milestone. Funds held securely. Released only when you approve the completed work.' },
  { icon: '📊', title: 'Project Dashboard', desc: 'Real-time project status, spend tracking, and milestone progress — always visible.' },
  { icon: '⚖️', title: 'Evidence Disputes', desc: 'Every dispute resolved using locked design, BOQ, chat records, and milestone proofs.' },
  { icon: '👨‍👩‍👧', title: 'Family Collaboration', desc: 'Invite family members as viewers or co-approvers. Interior decisions made together.' },
];

const vendorFeatures = [
  { icon: '⚡', title: 'Smart BOQ Builder', desc: 'Auto-suggest line items, rates, and quantities. Build professional BOQs in minutes.' },
  { icon: '💰', title: 'Predictable Payouts', desc: 'Escrow-backed payments. Get paid within 48 hours of milestone approval. No chasing.' },
  { icon: '📈', title: 'Reliability Scorecard', desc: 'Build a verified track record. Your delivery history and payment discipline — visible to customers.' },
  { icon: '🔄', title: 'Variation Control', desc: 'Raise formal variations with price and time impact. No more unpaid extra work.' },
  { icon: '📱', title: 'Mobile Evidence', desc: 'Upload milestone proof from site. Works offline. Syncs when connected.' },
  { icon: '🏆', title: 'Command Center', desc: 'Workload forecast, cash-in pipeline, delay alerts — all your projects in one view.' },
];

function useScrollReveal(options: { threshold?: number } = {}) {
  const { threshold = 0.15 } = options;
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

export function FeaturesSection() {
  const [tab, setTab] = useState<'customer' | 'vendor'>('customer');
  const [displayTab, setDisplayTab] = useState<'customer' | 'vendor'>('customer');
  const [isContentVisible, setIsContentVisible] = useState(true);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({ threshold: 0.05 });

  const features = displayTab === 'customer' ? customerFeatures : vendorFeatures;

  useEffect(() => {
    return () => { if (transitionRef.current) clearTimeout(transitionRef.current); };
  }, []);

  const handleTabChange = (nextTab: 'customer' | 'vendor') => {
    if (nextTab === tab) return;
    setIsContentVisible(false);
    if (transitionRef.current) clearTimeout(transitionRef.current);
    transitionRef.current = setTimeout(() => {
      setTab(nextTab);
      setDisplayTab(nextTab);
      setIsContentVisible(true);
    }, 220);
  };

  return (
    <section id="features" className="py-28 relative overflow-hidden bg-secondary/50 dark:bg-card/30 story-chapter">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'hsl(38 75% 55%)' }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <span className="text-sm font-semibold font-sans tracking-widest uppercase text-accent">
              Platform Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground text-balance">
            Designed for Homeowners and Contractors —{' '}
            <span className="gold-text">Premium project delivery</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-16">
          {(['customer', 'vendor'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-6 py-3 rounded-xl text-sm font-sans font-semibold transition-all duration-300 ${
                tab === t
                  ? 'shadow-lg text-[hsl(0_0%_4%)]'
                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={tab === t ? { background: 'var(--gold-gradient)' } : undefined}
            >
              {t === 'customer' ? '🏠 For Homeowners' : '🔨 For Contractors'}
            </button>
          ))}
        </div>

        <div
          ref={gridRef}
          className={`grid md:grid-cols-2 lg:grid-cols-3 gap-7 transition-all duration-500 ease-out ${
            isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card rounded-2xl p-9 group cursor-default hover:-translate-y-1.5 transition-all duration-700 ${
                gridVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl mb-6">{f.icon}</div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground font-sans leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
