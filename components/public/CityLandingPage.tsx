'use client';

/**
 * CityLandingPage — reusable city landing page template.
 * 0.17: Build city landing pages (/cities/bengaluru, /cities/mumbai, etc.)
 */

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Star, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { formatInrCompact } from '@/lib/utils/money';

interface CityData {
  name: string;
  state: string;
  heroImage: string;
  projectCount: number;
  vendorCount: number;
  avgRating: number;
  totalEscrowPaise: number;
  topNeighbourhoods: string[];
  popularSpaces: string[];
  featuredProjects: {
    title: string;
    budget: string;
    status: string;
    imageUrl: string;
  }[];
}

interface CityLandingPageProps {
  city: CityData;
}

export function CityLandingPage({ city }: CityLandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <Image
          src={city.heroImage}
          alt={`Interior design in ${city.name}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 container mx-auto px-6 pb-12">
          <div className="glass-pill inline-flex items-center gap-2 mb-4">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">
              {city.state}
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-3">
            Interior Design in{' '}
            <span className="gold-text italic">{city.name}</span>
          </h1>
          <p className="text-white/70 font-sans text-lg max-w-xl">
            {city.projectCount}+ projects completed. {city.vendorCount}+ verified vendors.
            Escrow-backed execution across {city.name}.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card/50 border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            {[
              { val: `${city.projectCount}+`, label: 'Projects Completed' },
              { val: `${city.vendorCount}+`, label: 'Verified Vendors' },
              { val: city.avgRating.toFixed(1), label: 'Avg Vendor Rating' },
              { val: formatInrCompact(city.totalEscrowPaise), label: 'Escrow Protected' },
            ].map((s) => (
              <div key={s.label} className="ivory-card rounded-2xl p-5">
                <p className="font-serif text-2xl font-bold gold-text">{s.val}</p>
                <p className="text-xs text-muted-foreground font-sans mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular spaces */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Popular Spaces in {city.name}
          </h2>
          <div className="flex flex-wrap gap-3">
            {city.popularSpaces.map((space) => (
              <Link
                key={space}
                href={`/explore?city=${city.name}&space=${space}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-accent/40 hover:bg-accent/5 transition-all"
              >
                {space}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="py-16 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-8">
            Recent Projects in {city.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {city.featuredProjects.map((p) => (
              <div key={p.title} className="ivory-card rounded-2xl overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-serif font-semibold text-foreground">{p.title}</p>
                  <p className="text-sm text-accent font-sans mt-1">{p.budget}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighbourhoods */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Top Neighbourhoods
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {city.topNeighbourhoods.map((n) => (
              <div key={n} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-sm font-medium text-foreground">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card/30 border-t border-border/50">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-accent" />
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
            Start Your {city.name} Project
          </h2>
          <p className="text-muted-foreground font-sans mb-8">
            Get 3 free AI designs and receive anonymous bids from {city.vendorCount}+ verified vendors in {city.name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register/customer"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
            >
              <Sparkles className="h-5 w-5" />
              Get Free AI Designs
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-semibold text-foreground hover:bg-muted/30 transition-all"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
