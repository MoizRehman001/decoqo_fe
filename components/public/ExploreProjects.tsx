'use client';

/**
 * ExploreProjects — public project explorer with filters.
 * 0.15: Build /explore public project explorer with filters
 * Shows anonymized projects (no customer names, no vendor names).
 */

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, MapPin, IndianRupee, Clock, Users,
  Sparkles, ArrowRight, SlidersHorizontal, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatInrCompact } from '@/lib/utils/money';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock public project data (anonymized)
// ---------------------------------------------------------------------------

const PUBLIC_PROJECTS = [
  {
    id: 'pub_001',
    title: '3BHK Full Home Renovation',
    city: 'Bengaluru',
    spaceType: 'RESIDENTIAL',
    budgetMin: 1500000,
    budgetMax: 2500000,
    status: 'BIDDING_OPEN',
    bidsCount: 7,
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
    path: 'AI_DESIGN',
    timeline: '12 weeks',
    rooms: 4,
    publishedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'pub_002',
    title: 'Modular Kitchen Upgrade',
    city: 'Mumbai',
    spaceType: 'RESIDENTIAL',
    budgetMin: 400000,
    budgetMax: 700000,
    status: 'IN_PROGRESS',
    bidsCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    path: 'BIDDING',
    timeline: '6 weeks',
    rooms: 1,
    publishedAt: '2025-01-05T09:00:00Z',
  },
  {
    id: 'pub_003',
    title: 'Modern Office Interior',
    city: 'Delhi NCR',
    spaceType: 'OFFICE',
    budgetMin: 2000000,
    budgetMax: 4000000,
    status: 'IN_PROGRESS',
    bidsCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    path: 'BIDDING',
    timeline: '8 weeks',
    rooms: 3,
    publishedAt: '2024-12-01T08:00:00Z',
  },
  {
    id: 'pub_004',
    title: 'Master Bedroom Makeover',
    city: 'Hyderabad',
    spaceType: 'RESIDENTIAL',
    budgetMin: 300000,
    budgetMax: 500000,
    status: 'COMPLETED',
    bidsCount: 9,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    path: 'AI_DESIGN',
    timeline: '4 weeks',
    rooms: 1,
    publishedAt: '2024-10-10T10:00:00Z',
  },
  {
    id: 'pub_005',
    title: 'Premium Retail Store Interior',
    city: 'Chennai',
    spaceType: 'COMMERCIAL',
    budgetMin: 800000,
    budgetMax: 1500000,
    status: 'BIDDING_OPEN',
    bidsCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    path: 'BIDDING',
    timeline: '8 weeks',
    rooms: 2,
    publishedAt: '2025-01-18T11:00:00Z',
  },
  {
    id: 'pub_006',
    title: '2BHK Apartment Full Interior',
    city: 'Bengaluru',
    spaceType: 'RESIDENTIAL',
    budgetMin: 800000,
    budgetMax: 1200000,
    status: 'COMPLETED',
    bidsCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    path: 'AI_DESIGN',
    timeline: '8 weeks',
    rooms: 3,
    publishedAt: '2024-09-01T09:00:00Z',
  },
  {
    id: 'pub_007',
    title: 'Luxury Living Room Redesign',
    city: 'Pune',
    spaceType: 'RESIDENTIAL',
    budgetMin: 200000,
    budgetMax: 400000,
    status: 'BIDDING_OPEN',
    bidsCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    path: 'AI_DESIGN',
    timeline: '4 weeks',
    rooms: 1,
    publishedAt: '2025-01-22T15:00:00Z',
  },
  {
    id: 'pub_008',
    title: 'Corporate Office Renovation',
    city: 'Mumbai',
    spaceType: 'OFFICE',
    budgetMin: 3000000,
    budgetMax: 6000000,
    status: 'IN_PROGRESS',
    bidsCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
    path: 'BIDDING',
    timeline: '12 weeks',
    rooms: 5,
    publishedAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'pub_009',
    title: 'Wardrobe & Storage Solutions',
    city: 'Bengaluru',
    spaceType: 'RESIDENTIAL',
    budgetMin: 150000,
    budgetMax: 300000,
    status: 'COMPLETED',
    bidsCount: 11,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    path: 'BIDDING',
    timeline: '3 weeks',
    rooms: 2,
    publishedAt: '2024-11-15T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  BIDDING_OPEN: { label: 'Bidding Open', color: 'hsl(217 65% 60%)' },
  IN_PROGRESS:  { label: 'In Progress',  color: 'hsl(40 45% 55%)' },
  COMPLETED:    { label: 'Completed',    color: 'hsl(142 71% 45%)' },
};

const SPACE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL:  'Commercial',
  OFFICE:      'Office',
  FACTORY:     'Factory',
};

const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'];
const SPACES = ['All Types', 'RESIDENTIAL', 'OFFICE', 'COMMERCIAL'];
const STATUSES = ['All Status', 'BIDDING_OPEN', 'IN_PROGRESS', 'COMPLETED'];

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------

function ProjectCard({ project }: { project: typeof PUBLIC_PROJECTS[0] }) {
  const statusCfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG['BIDDING_OPEN']!;

  return (
    <div className="ivory-card rounded-2xl overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm"
            style={{ background: `${statusCfg.color}25`, color: statusCfg.color, border: `1px solid ${statusCfg.color}40` }}
          >
            {statusCfg.label}
          </span>
          {project.path === 'AI_DESIGN' && (
            <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-accent backdrop-blur-sm border border-accent/30">
              <Sparkles className="h-2.5 w-2.5" /> AI Design
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-white/80 font-sans">
            <MapPin className="h-3 w-3" /> {project.city}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/80 font-sans">
            <Users className="h-3 w-3" /> {project.bidsCount} bids
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-serif font-semibold text-foreground leading-snug">{project.title}</h3>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-sans">
          <span className="flex items-center gap-1">
            <IndianRupee className="h-3 w-3" />
            {formatInrCompact(project.budgetMin)} – {formatInrCompact(project.budgetMax)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {project.timeline}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5">
            {SPACE_LABELS[project.spaceType] ?? project.spaceType}
          </span>
        </div>

        <Link
          href="/register/customer"
          className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-xs font-semibold text-foreground hover:border-accent/40 hover:bg-accent/5 transition-all group/btn"
        >
          <span>View Project Details</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-accent transition-colors" />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExploreProjectsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [space, setSpace] = useState('All Types');
  const [status, setStatus] = useState('All Status');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return PUBLIC_PROJECTS.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase());
      const matchCity = city === 'All Cities' || p.city === city;
      const matchSpace = space === 'All Types' || p.spaceType === space;
      const matchStatus = status === 'All Status' || p.status === status;
      return matchSearch && matchCity && matchSpace && matchStatus;
    });
  }, [search, city, space, status]);

  const hasFilters = city !== 'All Cities' || space !== 'All Types' || status !== 'All Status';

  const clearFilters = () => {
    setCity('All Cities');
    setSpace('All Types');
    setStatus('All Status');
    setSearch('');
  };

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
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">Live Projects</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Explore <span className="gold-text italic">Real Projects</span>
          </h1>
          <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto mb-8">
            Browse live and completed interior projects across India. All projects are anonymized to protect customer privacy.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by project type or city…"
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
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
              className="sm:hidden gap-1.5"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {hasFilters && <span className="rounded-full bg-accent w-2 h-2" />}
            </Button>

            {/* Desktop filters */}
            <div className={cn('flex flex-wrap gap-3 w-full sm:w-auto', !showFilters && 'hidden sm:flex')}>
              {/* City */}
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>

              {/* Space type */}
              <select
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {SPACES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All Types' ? 'All Types' : SPACE_LABELS[s] ?? s}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All Status' ? 'All Status' : STATUS_CONFIG[s]?.label ?? s}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>

            <div className="ml-auto text-sm text-muted-foreground font-sans">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-serif text-xl font-semibold text-foreground">No projects found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">Clear Filters</Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}

          {/* Guest CTA */}
          <div className="mt-16 rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent" />
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">
              Ready to Start Your Project?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Get 3 free AI designs and receive anonymous bids from verified vendors across India.
            </p>
            <Link
              href="/register/customer"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
            >
              Start My Project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
