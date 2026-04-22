'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Gavel, LockKeyhole, ScrollText, ShieldCheck } from 'lucide-react';

function useScrollReveal(options: { threshold?: number } = {}) {
  const { threshold = 0.1 } = options;
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

const biddingJourney = [
  {
    step: '01',
    title: 'Design Lock',
    description: 'Customer defines space, uploads floor plan, and locks an AI-generated design. No changes after lock.',
    metric: '2–3 AI concepts generated',
    Icon: LockKeyhole,
  },
  {
    step: '02',
    title: 'Anonymous Bids',
    description: 'Verified vendors bid anonymously. Customer sees quotes, timelines, and portfolios — never identity.',
    metric: 'Avg 7 bids per project',
    Icon: Gavel,
  },
  {
    step: '03',
    title: 'BOQ Lock',
    description: 'Selected vendor builds a detailed Bill of Quantities. Customer approves. Locked before work begins.',
    metric: 'Zero scope creep',
    Icon: ScrollText,
  },
  {
    step: '04',
    title: 'Escrow Execution',
    description: 'Funds held in escrow. Released per milestone on customer approval. Full audit trail maintained.',
    metric: '48h avg payout',
    Icon: ShieldCheck,
  },
];

const trustSteps = [
  { id: '01', title: 'Design Proof', description: 'Locked AI design with version history. Immutable after customer approval.', proof: '✓ Design hash stored' },
  { id: '02', title: 'BOQ Proof', description: 'Every line item, rate, and quantity locked. Variations require formal approval.', proof: '✓ BOQ version locked' },
  { id: '03', title: 'Chat Proof', description: 'All negotiation messages archived. Contact masking enforced automatically.', proof: '✓ Messages archived' },
  { id: '04', title: 'Milestone Proof', description: 'Photo evidence, completion notes, and timestamps for every milestone.', proof: '✓ Evidence bundle' },
  { id: '05', title: 'Payment Proof', description: 'Escrow transactions, release events, and refund history — all on record.', proof: '✓ Escrow ledger' },
];

export function BiddingJourneySection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-28 relative overflow-hidden bg-secondary/40 dark:bg-card/20 story-chapter">
      <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,hsl(45_65%_52%_/_0.14),transparent_65%)] blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-3xl">
            <div className="glass-pill inline-flex items-center gap-2 mb-6">
              <span className="text-sm font-semibold font-sans tracking-widest uppercase text-accent">
                Anonymous Bidding Journey
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight text-balance">
              The customer journey moves cleanly from{' '}
              <span className="gold-text">design lock to funded execution</span>.
            </h2>
            <p className="text-lg text-muted-foreground mt-5 max-w-2xl leading-relaxed font-sans">
              Create, publish, bid, select, lock BOQ, fund escrow, approve milestones — and complete the audit trail.
            </p>
          </div>

          {/* Journey steps */}
          <div className="grid lg:grid-cols-4 gap-5 mt-12">
            {biddingJourney.map((phase, index) => (
              <article
                key={phase.step}
                className={`glass-card rounded-[1.75rem] p-6 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.3em] uppercase text-accent font-semibold">{phase.step}</span>
                  <div className="icon-container h-11 w-11 rounded-2xl flex items-center justify-center">
                    <phase.Icon className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <h3 className="mt-6 font-serif text-2xl font-semibold">{phase.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed font-sans">{phase.description}</p>
                <div className="mt-6 rounded-2xl bg-accent/10 px-4 py-3 text-sm font-medium text-foreground font-sans">
                  {phase.metric}
                </div>
              </article>
            ))}
          </div>

          {/* Trust timeline */}
          <div className="grid xl:grid-cols-[0.8fr_1.2fr] gap-6 mt-12">
            <div className="neu-card-3d rounded-[2rem] p-8">
              <div className="text-xs tracking-[0.3em] uppercase text-accent font-semibold font-sans">Trust Timeline</div>
              <h3 className="mt-4 font-serif text-3xl font-semibold">Every action leaves evidence.</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed font-sans">
                Customer, vendor and admin all operate on the same append-only story of the project. That is the real product.
              </p>
              <Link
                href="/register/customer"
                className="mt-6 w-full inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300"
                style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
              >
                Start as a customer
              </Link>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
              {trustSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`ivory-card p-5 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 90 + 120}ms` }}
                >
                  <div className="text-xs uppercase tracking-[0.28em] text-accent font-semibold font-sans">{step.title}</div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-sans">{step.description}</p>
                  <div className="mt-5 text-sm font-medium font-sans">{step.proof}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
