'use client';

/**
 * SpaceLandingPage — reusable space-type landing page template.
 * 0.18: Build space-type landing pages (/spaces/modular-kitchen, etc.)
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, CheckCircle2, IndianRupee, Clock } from 'lucide-react';

interface SpaceData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage: string;
  avgBudgetMin: number;
  avgBudgetMax: number;
  avgTimeline: string;
  projectCount: number;
  features: string[];
  galleryImages: string[];
  faqs: { q: string; a: string }[];
}

interface SpaceLandingPageProps {
  space: SpaceData;
}

export function SpaceLandingPage({ space }: SpaceLandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[65vh] min-h-[450px] flex items-end overflow-hidden">
        <Image
          src={space.heroImage}
          alt={space.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="relative z-10 container mx-auto px-6 pb-14">
          <div className="glass-pill inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">
              {space.projectCount}+ Projects Completed
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-3">
            {space.name}{' '}
            <span className="gold-text italic">Design</span>
          </h1>
          <p className="text-white/70 font-sans text-lg max-w-xl mb-6">{space.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register/customer"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
            >
              <Sparkles className="h-5 w-5" />
              Get Free AI Designs
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="py-10 bg-card/50 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
            {[
              { icon: IndianRupee, val: `₹${Math.round(space.avgBudgetMin / 100000)}L – ₹${Math.round(space.avgBudgetMax / 100000)}L`, label: 'Typical Budget' },
              { icon: Clock, val: space.avgTimeline, label: 'Avg Timeline' },
              { icon: Sparkles, val: `${space.projectCount}+`, label: 'Completed' },
            ].map((s) => (
              <div key={s.label} className="ivory-card rounded-2xl p-5">
                <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="font-serif text-xl font-bold gold-text">{s.val}</p>
                <p className="text-xs text-muted-foreground font-sans mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description + features */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                Why Choose Decoqo for Your {space.name}?
              </h2>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">{space.description}</p>
              <div className="space-y-3">
                {space.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="text-sm text-foreground font-sans">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {space.galleryImages.slice(0, 4).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src={img}
                    alt={`${space.name} design ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-8">
            {space.name} Design FAQ
          </h2>
          <div className="space-y-4">
            {space.faqs.map((faq) => (
              <div key={faq.q} className="ivory-card rounded-xl p-5">
                <p className="font-serif font-semibold text-foreground mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
            Ready to Transform Your {space.name}?
          </h2>
          <p className="text-muted-foreground font-sans mb-8">
            Get 3 free AI designs tailored to your space and budget. Then receive anonymous bids from verified vendors.
          </p>
          <Link
            href="/register/customer"
            className="inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
          >
            <Sparkles className="h-5 w-5" />
            Start My {space.name} Project
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
