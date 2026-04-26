'use client';

/**
 * PricingPage — transparent pricing for customers and vendors.
 * 0.19: Build /pricing page
 */

import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, Shield, Wallet,
  BadgeCheck, Users, Sparkles, IndianRupee,
} from 'lucide-react';

const CUSTOMER_FEATURES = [
  'Unlimited AI design generations',
  'Anonymous bidding from verified vendors',
  'Escrow-backed milestone payments',
  'BOQ lock — no surprise costs',
  'Dispute resolution within 48 hours',
  'Real-time project tracking',
  'Contact masking for privacy',
  'Dedicated project support',
];

const VENDOR_TIERS = [
  {
    name: 'Starter',
    fee: '3%',
    desc: 'For new vendors getting started on Decoqo',
    projects: 'First 10 projects',
    features: [
      'Access to all project listings',
      'Anonymous bidding system',
      'Escrow payment protection',
      'Basic KYC verification',
      'Standard support',
    ],
    color: 'hsl(217 65% 60%)',
    cta: 'Join as Vendor',
  },
  {
    name: 'Professional',
    fee: '2.5%',
    desc: 'For established vendors with a track record',
    projects: '11–50 projects',
    features: [
      'Everything in Starter',
      'Priority listing in search',
      'Verified badge on profile',
      'Advanced analytics dashboard',
      'Priority support',
    ],
    color: 'hsl(40 45% 55%)',
    cta: 'Join as Vendor',
    recommended: true,
  },
  {
    name: 'Elite',
    fee: '2%',
    desc: 'For top-rated vendors with 50+ completions',
    projects: '50+ projects',
    features: [
      'Everything in Professional',
      'Elite badge on profile',
      'Featured in city pages',
      'Dedicated account manager',
      'Early access to new features',
    ],
    color: 'hsl(142 71% 45%)',
    cta: 'Apply for Elite',
  },
];

const FAQS = [
  {
    q: 'When does the vendor fee apply?',
    a: 'The success fee is charged only when a project is fully completed and all escrow payments are released. No fee on bids, negotiations, or incomplete projects.',
  },
  {
    q: 'Are there any hidden charges?',
    a: 'No. Customers pay zero platform fees. Vendors pay only the success fee on completed projects. Razorpay payment processing fees (1.5–2%) are separate and standard.',
  },
  {
    q: 'How is the success fee calculated?',
    a: 'The fee is calculated on the total project value (grand total of the locked BOQ). For example, on a ₹10L project at 2.5%, the fee is ₹25,000.',
  },
  {
    q: 'Can I upgrade my vendor tier?',
    a: 'Yes. Tier upgrades happen automatically based on completed project count. You can also apply for Elite status manually if you meet the criteria.',
  },
];

export function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(45 65% 52% / 0.07), transparent 60%)' }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">Transparent Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Simple, Fair{' '}
            <span className="gold-text italic">Pricing</span>
          </h1>
          <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto">
            Customers pay nothing. Vendors pay only when they succeed. That&apos;s how trust-first pricing works.
          </p>
        </div>
      </section>

      {/* Customer — Free */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(38 40% 42% / 0.12), hsl(45 55% 68% / 0.08))',
                border: '1px solid hsl(45 65% 52% / 0.25)',
              }}
            >
              {/* Glow */}
              <div
                className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
                style={{ background: 'var(--gold-gradient)' }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-accent" />
                      <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">For Customers</span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-foreground">Always Free</h2>
                    <p className="text-muted-foreground font-sans mt-1">
                      Zero platform fees. Pay only your vendor — nothing to Decoqo.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-5xl font-bold gold-text">₹0</p>
                    <p className="text-xs text-muted-foreground font-sans">platform fee</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {CUSTOMER_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-foreground font-sans">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  href="/register/customer"
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
                >
                  <Sparkles className="h-5 w-5" />
                  Start My Project — Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor tiers */}
      <section className="py-16 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <IndianRupee className="h-5 w-5 text-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">For Vendors</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Success-Based Pricing
            </h2>
            <p className="text-muted-foreground font-sans max-w-xl mx-auto">
              Pay only when you complete a project. No monthly fees, no listing fees, no hidden charges.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {VENDOR_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  tier.recommended ? 'ring-2 ring-accent/50' : ''
                }`}
                style={{
                  background: tier.recommended
                    ? 'linear-gradient(135deg, hsl(38 40% 42% / 0.1), hsl(45 55% 68% / 0.06))'
                    : 'hsl(var(--card))',
                  border: `1px solid ${tier.color}30`,
                }}
              >
                {tier.recommended && (
                  <div
                    className="absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-[10px] font-bold"
                    style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-serif text-xl font-bold text-foreground">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">{tier.projects}</p>
                </div>

                <div className="mb-5">
                  <span className="font-serif text-4xl font-bold" style={{ color: tier.color }}>
                    {tier.fee}
                  </span>
                  <span className="text-sm text-muted-foreground font-sans ml-1">success fee</span>
                  <p className="text-xs text-muted-foreground font-sans mt-1">{tier.desc}</p>
                </div>

                <div className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-foreground font-sans">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: tier.color }} />
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  href="/register/vendor"
                  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: `${tier.color}40`,
                    color: tier.color,
                    background: `${tier.color}08`,
                  }}
                >
                  {tier.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            {[
              { icon: Shield, label: 'Escrow Protected', desc: 'All payments held securely', color: 'hsl(40 45% 55%)' },
              { icon: BadgeCheck, label: 'KYC Verified', desc: 'Every vendor background-checked', color: 'hsl(142 71% 45%)' },
              { icon: Wallet, label: 'No Hidden Fees', desc: 'Transparent pricing always', color: 'hsl(217 65% 60%)' },
            ].map((item) => (
              <div key={item.label} className="ivory-card rounded-2xl p-6">
                <div
                  className="flex h-12 w-12 mx-auto mb-3 items-center justify-center rounded-xl"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="font-serif font-bold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground font-sans mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-card/30 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-8">
            Pricing FAQ
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="ivory-card rounded-xl p-5">
                <p className="font-serif font-semibold text-foreground mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
