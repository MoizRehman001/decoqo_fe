'use client';

/**
 * Vendor browse projects page — filter by city, budget, category.
 * VEND-10 through VEND-15
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, IndianRupee, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectStatusBadge } from '@/components/project/ProjectStatusBadge';
import { formatInr } from '@/lib/utils/money';
import { useQuery } from '@tanstack/react-query';
import { mockProjectApi } from '@/mock/mockData';
import type { Project } from '@/types/project.types';
import { cn } from '@/lib/utils';

const CITIES = ['All', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'] as const;
const BUDGET_BANDS = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₹5L', min: 0, max: 500000 },
  { label: '₹5L–₹15L', min: 500000, max: 1500000 },
  { label: '₹15L–₹40L', min: 1500000, max: 4000000 },
  { label: '₹40L+', min: 4000000, max: Infinity },
] as const;

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        active
          ? 'border-transparent text-[hsl(0_0%_4%)]'
          : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground',
      )}
      style={active ? { background: 'var(--gold-gradient)' } : undefined}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function VendorProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/vendor/projects/${project.id}`}
      className="group block ivory-card rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-foreground truncate group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {project.city}
          </div>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">
            {formatInr(project.budgetMin)} – {formatInr(project.budgetMax)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {project.bidsCount} bid{project.bidsCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {project.spaceType.replace('_', ' ')}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          {project.timeline.replace('_', ' ')}
        </span>
      </div>
    </Link>
  );
}

export default function VendorBrowseProjectsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState<string>('All');
  const [budgetIdx, setBudgetIdx] = useState(0);

  const { data: allProjects, isLoading } = useQuery<Project[], Error>({
    queryKey: ['projects', 'all'],
    queryFn: () => mockProjectApi.getAllProjects(),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const band = BUDGET_BANDS[budgetIdx];
    return (allProjects ?? [])
      .filter((p) => p.status === 'BIDDING_OPEN')
      .filter((p) => city === 'All' || p.city === city)
      .filter((p) => !band || (p.budgetMax >= band.min && p.budgetMin <= band.max))
      .filter((p) =>
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()),
      );
  }, [allProjects, city, budgetIdx, search]);

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Browse Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find projects that match your expertise and bid anonymously.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Search by title or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3 w-3" aria-hidden="true" /> City
          </div>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <FilterChip key={c} label={c} active={city === c} onClick={() => setCity(c)} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IndianRupee className="h-3 w-3" aria-hidden="true" /> Budget
          </div>
          <div className="flex flex-wrap gap-2">
            {BUDGET_BANDS.map((b, i) => (
              <FilterChip key={b.label} label={b.label} active={budgetIdx === i} onClick={() => setBudgetIdx(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''} available`}
        </p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-serif text-lg font-semibold text-foreground">No projects found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <VendorProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
