'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Users } from 'lucide-react';

const FILTERS = ['All', 'Kitchen', 'Living Room', 'Bedroom', 'Office', 'Full Home'] as const;
type Filter = (typeof FILTERS)[number];

interface Project {
  id: number;
  type: Filter;
  city: string;
  budgetMin: number;
  budgetMax: number;
  bids: number;
  daysLeft: number;
  gradient: string;
  label: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    type: 'Kitchen',
    city: 'Bengaluru',
    budgetMin: 4,
    budgetMax: 6,
    bids: 7,
    daysLeft: 3,
    gradient: 'linear-gradient(135deg, hsl(217 65% 20%), hsl(217 65% 35%))',
    label: 'Modular Kitchen Renovation',
  },
  {
    id: 2,
    type: 'Living Room',
    city: 'Mumbai',
    budgetMin: 8,
    budgetMax: 12,
    bids: 4,
    daysLeft: 5,
    gradient: 'linear-gradient(135deg, hsl(142 40% 18%), hsl(142 40% 30%))',
    label: 'Contemporary Living Space',
  },
  {
    id: 3,
    type: 'Full Home',
    city: 'Delhi NCR',
    budgetMin: 25,
    budgetMax: 40,
    bids: 11,
    daysLeft: 2,
    gradient: 'linear-gradient(135deg, hsl(38 50% 20%), hsl(42 55% 35%))',
    label: '3BHK Full Home Interior',
  },
  {
    id: 4,
    type: 'Bedroom',
    city: 'Hyderabad',
    budgetMin: 3,
    budgetMax: 5,
    bids: 6,
    daysLeft: 7,
    gradient: 'linear-gradient(135deg, hsl(280 40% 18%), hsl(280 40% 30%))',
    label: 'Master Bedroom Makeover',
  },
  {
    id: 5,
    type: 'Office',
    city: 'Pune',
    budgetMin: 15,
    budgetMax: 22,
    bids: 9,
    daysLeft: 4,
    gradient: 'linear-gradient(135deg, hsl(0 40% 18%), hsl(0 40% 30%))',
    label: 'Startup Office Fit-Out',
  },
  {
    id: 6,
    type: 'Kitchen',
    city: 'Chennai',
    budgetMin: 5,
    budgetMax: 8,
    bids: 5,
    daysLeft: 6,
    gradient: 'linear-gradient(135deg, hsl(190 50% 18%), hsl(190 50% 30%))',
    label: 'Open Kitchen + Dining',
  },
];

const TYPE_COLORS: Record<Filter, string> = {
  All: 'hsl(var(--accent))',
  Kitchen: 'hsl(217 65% 60%)',
  'Living Room': 'hsl(142 71% 45%)',
  Bedroom: 'hsl(280 60% 65%)',
  Office: 'hsl(0 72% 60%)',
  'Full Home': 'hsl(40 45% 55%)',
};

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

function ProjectCard({ project, index, visible }: { project: Project; index: number; visible: boolean }) {
  const color = TYPE_COLORS[project.type];

  return (
    <div
      className={`neu-card-3d rounded-2xl overflow-hidden group cursor-pointer transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Thumbnail placeholder */}
      <div
        className="relative h-44 flex items-end p-4"
        style={{ background: project.gradient }}
      >
        {/* Skeleton shimmer overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="skeleton w-full h-full" />
        </div>

        {/* AI design label */}
        <div className="relative z-10 flex items-center gap-1.5 glass-pill text-xs font-sans font-medium text-white/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI Design Ready
        </div>

        {/* Days left badge */}
        <div
          className="absolute top-3 right-3 text-[10px] font-bold font-sans px-2 py-1 rounded-full"
          style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}
        >
          {project.daysLeft}d left
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-bold font-sans uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: `${color}15`, color }}
          >
            {project.type}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
            <MapPin className="w-3 h-3" />
            {project.city}
          </div>
        </div>

        <h3 className="font-serif font-semibold text-foreground text-base leading-snug mb-3">
          {project.label}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted-foreground font-sans mb-0.5">Budget Range</div>
            <div className="font-semibold text-foreground font-sans text-sm">
              ₹{project.budgetMin}L – ₹{project.budgetMax}L
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-sans mb-0.5">Bids Received</div>
            <div className="flex items-center gap-1 justify-end">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span className="font-semibold text-foreground font-sans text-sm">{project.bids} bids</span>
            </div>
          </div>
        </div>

        <button
          className="w-full py-2.5 rounded-xl text-sm font-semibold font-sans transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
        >
          View Project
        </button>
      </div>
    </div>
  );
}

export function MarketplaceSection() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const { ref, isVisible } = useScrollReveal();

  const filtered =
    activeFilter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.type === activeFilter);

  return (
    <section className="py-24 sm:py-32 story-chapter" style={{ background: 'hsl(var(--secondary) / 0.4)' }}>
      <div className="container mx-auto px-6" ref={ref}>
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <div className="glass-pill inline-flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent font-sans">
                Live Marketplace
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
              Browse Live{' '}
              <span className="gold-text italic">Projects</span>
            </h2>
            <p className="text-muted-foreground font-sans mt-3 max-w-lg">
              Real projects, real budgets, real competition. Vendors bid anonymously — customers win.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent font-sans hover:gap-3 transition-all duration-300 flex-shrink-0"
          >
            Explore All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter chips */}
        <div
          className={`flex flex-wrap gap-2 mb-10 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-300 border ${
                activeFilter === f
                  ? 'text-[hsl(0_0%_4%)] border-transparent shadow-md'
                  : 'border-border/60 text-muted-foreground hover:border-accent/40 hover:text-foreground bg-card/50'
              }`}
              style={activeFilter === f ? { background: 'var(--gold-gradient)' } : undefined}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} visible={isVisible} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold font-sans border border-accent/30 text-accent hover:bg-accent/5 transition-all duration-300"
          >
            Explore All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
