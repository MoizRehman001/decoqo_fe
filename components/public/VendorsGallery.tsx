'use client';

/**
 * VendorsGallery — public vendor portfolio gallery.
 * 0.16: Build /vendors public vendor portfolio gallery
 */

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Star, BadgeCheck, ArrowRight, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock public vendor data (anonymized portfolios)
// ---------------------------------------------------------------------------

const PUBLIC_VENDORS = [
  {
    id: 'v_001',
    displayName: 'Studio A',
    city: 'Bengaluru',
    categories: ['Full Home', 'Modular Kitchen', 'Living Room'],
    rating: 4.8,
    reviewCount: 47,
    completedProjects: 63,
    yearsExperience: 12,
    isVerified: true,
    bio: '12 years delivering premium residential interiors. Specialise in contemporary and Scandinavian styles.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
    ],
    avgBudget: '₹8L – ₹25L',
    avgTimeline: '6–12 weeks',
  },
  {
    id: 'v_002',
    displayName: 'Studio B',
    city: 'Mumbai',
    categories: ['Bedroom', 'Living Room', 'Office'],
    rating: 4.6,
    reviewCount: 31,
    completedProjects: 41,
    yearsExperience: 8,
    isVerified: true,
    bio: 'Award-winning interior studio known for luxury finishes and attention to detail.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
    ],
    avgBudget: '₹5L – ₹20L',
    avgTimeline: '4–10 weeks',
  },
  {
    id: 'v_003',
    displayName: 'Studio C',
    city: 'Delhi NCR',
    categories: ['Office', 'Commercial', 'Full Home'],
    rating: 4.7,
    reviewCount: 28,
    completedProjects: 35,
    yearsExperience: 10,
    isVerified: true,
    bio: 'Corporate and residential specialist with a focus on functional elegance and smart space planning.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80',
    ],
    avgBudget: '₹10L – ₹50L',
    avgTimeline: '8–16 weeks',
  },
  {
    id: 'v_004',
    displayName: 'Studio D',
    city: 'Hyderabad',
    categories: ['Modular Kitchen', 'Wardrobe', 'Bedroom'],
    rating: 4.5,
    reviewCount: 22,
    completedProjects: 29,
    yearsExperience: 6,
    isVerified: true,
    bio: 'Modular furniture specialist with expertise in space-efficient designs for urban apartments.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=400&q=80',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
    ],
    avgBudget: '₹3L – ₹12L',
    avgTimeline: '3–8 weeks',
  },
  {
    id: 'v_005',
    displayName: 'Studio E',
    city: 'Pune',
    categories: ['Full Home', 'Living Room', 'Bedroom'],
    rating: 4.4,
    reviewCount: 18,
    completedProjects: 24,
    yearsExperience: 5,
    isVerified: true,
    bio: 'Young studio with fresh perspectives on contemporary Indian interiors. Budget-conscious without compromising quality.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1600210491892-03d54730d73e?w=400&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
    ],
    avgBudget: '₹2L – ₹10L',
    avgTimeline: '4–8 weeks',
  },
  {
    id: 'v_006',
    displayName: 'Studio F',
    city: 'Chennai',
    categories: ['Commercial', 'Retail', 'Office'],
    rating: 4.9,
    reviewCount: 15,
    completedProjects: 19,
    yearsExperience: 9,
    isVerified: true,
    bio: 'Commercial interior specialist with deep expertise in retail, hospitality, and corporate spaces.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=400&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80',
    ],
    avgBudget: '₹15L – ₹1Cr',
    avgTimeline: '8–20 weeks',
  },
];

const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'];
const CATEGORIES = ['All Categories', 'Full Home', 'Modular Kitchen', 'Living Room', 'Bedroom', 'Office', 'Commercial'];

// ---------------------------------------------------------------------------
// Vendor card
// ---------------------------------------------------------------------------

function VendorCard({ vendor }: { vendor: typeof PUBLIC_VENDORS[0] }) {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="ivory-card rounded-2xl overflow-hidden group">
      {/* Portfolio images */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={vendor.portfolioImages[activeImg] ?? vendor.portfolioImages[0]!}
          alt={`${vendor.displayName} portfolio`}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Image dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {vendor.portfolioImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImg(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                i === activeImg ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
              )}
              aria-label={`View image ${i + 1}`}
            />
          ))}
        </div>

        {/* Verified badge */}
        {vendor.isVerified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <BadgeCheck className="h-3 w-3" /> KYC Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-foreground text-lg">{vendor.displayName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" /> {vendor.city}
              <span>·</span>
              <Briefcase className="h-3 w-3" /> {vendor.yearsExperience} yrs
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-serif font-bold text-foreground">{vendor.rating}</span>
            <span className="text-xs text-muted-foreground">({vendor.reviewCount})</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-sans leading-relaxed line-clamp-2">{vendor.bio}</p>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {vendor.categories.slice(0, 3).map((c) => (
            <span key={c} className="rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
              {c}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { val: vendor.completedProjects, label: 'Projects' },
            { val: vendor.avgBudget, label: 'Budget' },
            { val: vendor.avgTimeline, label: 'Timeline' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-muted/30 p-2">
              <p className="text-xs font-bold text-foreground truncate">{s.val}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Link
          href="/register/customer"
          className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-xs font-semibold text-foreground hover:border-accent/40 hover:bg-accent/5 transition-all group/btn"
        >
          <span>Request This Vendor</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-accent transition-colors" />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function VendorsGalleryPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [category, setCategory] = useState('All Categories');

  const filtered = useMemo(() => {
    return PUBLIC_VENDORS.filter((v) => {
      const matchSearch =
        !search.trim() ||
        v.displayName.toLowerCase().includes(search.toLowerCase()) ||
        v.city.toLowerCase().includes(search.toLowerCase()) ||
        v.categories.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      const matchCity = city === 'All Cities' || v.city === city;
      const matchCat = category === 'All Categories' || v.categories.includes(category);
      return matchSearch && matchCity && matchCat;
    });
  }, [search, city, category]);

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
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">Verified Vendors</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            India&apos;s Best{' '}
            <span className="gold-text italic">Interior Studios</span>
          </h1>
          <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto mb-8">
            Every vendor is KYC-verified, background-checked, and escrow-ready. Browse portfolios and find your perfect match.
          </p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by city, specialisation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl text-base"
            />
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="ml-auto text-sm text-muted-foreground">
              {filtered.length} vendor{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => <VendorCard key={v.id} vendor={v} />)}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="font-serif text-xl font-semibold text-foreground">No vendors found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center">
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">
              Are You an Interior Vendor?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Join Decoqo&apos;s verified vendor network. Get access to qualified leads, escrow-backed payments, and a platform that protects your work.
            </p>
            <Link
              href="/register/vendor"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold border border-border hover:bg-muted/30 transition-all"
            >
              Join as Vendor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
