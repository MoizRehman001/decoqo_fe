'use client';

/**
 * Vendor Browse Projects — enhanced with bid-awareness.
 *
 * Design decisions:
 * - Projects the vendor has already bid on show a "Bid Submitted" overlay
 *   with their bid status — they can still click to view the project
 * - Projects open for bidding show a clear "Submit Bid" CTA
 * - Two sections: "Open to Bid" and "Already Bid" (collapsible)
 * - Filter chips for city and budget
 * - Search by title or city
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, IndianRupee, Filter,
  CheckCircle2, Clock, Star, Trophy,
  ChevronDown, ChevronUp, ArrowRight, Sparkles,
} from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProjectStatusBadge } from '@/components/project/ProjectStatusBadge';
import { formatInr } from '@/lib/utils/money';
import { useAvailableProjects, useMyBids } from '@/lib/api/bidding';
import type { Project } from '@/types/project.types';
import type { Bid, BidStatus } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CITIES = ['All', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'] as const;

const BUDGET_BANDS = [
  { label: 'All',        min: 0,         max: Infinity },
  { label: 'Under ₹5L', min: 0,         max: 500_000 },
  { label: '₹5L–₹15L',  min: 500_000,   max: 1_500_000 },
  { label: '₹15L–₹40L', min: 1_500_000, max: 4_000_000 },
  { label: '₹40L+',     min: 4_000_000, max: Infinity },
] as const;

const BID_STATUS_DISPLAY: Record<BidStatus, { label: string; icon: React.ElementType; class: string }> = {
  PENDING:     { label: 'Bid Under Review', icon: Clock,        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800' },
  SHORTLISTED: { label: 'Shortlisted ★',   icon: Star,         class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800' },
  SELECTED:    { label: 'You Were Selected', icon: Trophy,      class: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800' },
  REJECTED:    { label: 'Not Selected',    icon: CheckCircle2,  class: 'bg-muted text-muted-foreground border-border' },
  WITHDRAWN:   { label: 'Bid Withdrawn',   icon: CheckCircle2,  class: 'bg-muted text-muted-foreground border-border' },
};

// ---------------------------------------------------------------------------
// Filter chip
// ---------------------------------------------------------------------------

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        active
          ? 'border-transparent text-[hsl(0_0%_4%)]'
          : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground',
      )}
      style={active ? { background: 'var(--gold-gradient)' } : undefined}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Project card — open for bidding
// ---------------------------------------------------------------------------

function OpenProjectCard({ project }: { project: Project }) {
  const rooms = (project as Project & { rooms?: { name: string }[] }).rooms ?? [];

  return (
    <Link
      href={`/vendor/projects/${project.id}`}
      className="group block rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif font-semibold text-foreground transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            {project.city}
            {(project as Project & { pincode?: string }).pincode && (
              <span className="text-muted-foreground/60">
                · {(project as Project & { pincode?: string }).pincode}
              </span>
            )}
          </div>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Budget */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">
            {project.budgetMin ? formatInr(project.budgetMin) : '—'}
            {' – '}
            {project.budgetMax ? formatInr(project.budgetMax) : 'Any'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {(project as Project & { bidsCount?: number }).bidsCount ?? 0} bid
          {((project as Project & { bidsCount?: number }).bidsCount ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {project.spaceType && (
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            {project.spaceType.replace(/_/g, ' ')}
          </span>
        )}
        {(project as Project & { timelineWeeks?: number }).timelineWeeks && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {(project as Project & { timelineWeeks?: number }).timelineWeeks}w timeline
          </span>
        )}
        {rooms.length > 0 && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {project.description
            ? project.description.slice(0, 60) + (project.description.length > 60 ? '…' : '')
            : 'Click to view details and submit your bid'}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent">
          Bid Now <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Project card — already bid
// ---------------------------------------------------------------------------

function BidSubmittedCard({ project, bid }: { project: Project; bid: Bid }) {
  const statusDisplay = BID_STATUS_DISPLAY[bid.status];
  const StatusIcon = statusDisplay.icon;
  const isActive = bid.status === 'PENDING' || bid.status === 'SHORTLISTED';
  const isSelected = bid.status === 'SELECTED';

  const totalInr = bid.boqItems?.length
    ? bid.boqItems.reduce((s, i) => s + i.amountInr, 0)
    : (bid.totalQuoteInr ?? 0);

  return (
    <Link
      href={`/vendor/projects/${project.id}`}
      className={cn(
        'group block rounded-2xl border p-5 transition-all duration-200',
        isSelected
          ? 'border-green-200 bg-green-50/30 hover:-translate-y-1 dark:border-green-800 dark:bg-green-950/10'
          : bid.status === 'SHORTLISTED'
          ? 'border-amber-200 bg-amber-50/30 hover:-translate-y-1 dark:border-amber-800 dark:bg-amber-950/10'
          : 'border-border bg-muted/20 opacity-80 hover:opacity-100',
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={cn(
            'truncate font-serif font-semibold transition-colors',
            isSelected ? 'text-green-800 dark:text-green-200'
              : bid.status === 'SHORTLISTED' ? 'text-amber-800 dark:text-amber-200'
              : 'text-muted-foreground',
          )}>
            {project.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            {project.city}
          </div>
        </div>
        {/* Bid status badge */}
        <span className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
          statusDisplay.class,
        )}>
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {statusDisplay.label}
        </span>
      </div>

      {/* Your bid summary */}
      <div className={cn(
        'mb-3 rounded-xl border px-3 py-2.5',
        isSelected ? 'border-green-200/60 bg-green-50/40 dark:border-green-800/40 dark:bg-green-950/10'
          : bid.status === 'SHORTLISTED' ? 'border-amber-200/60 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/10'
          : 'border-border/60 bg-background/40',
      )}>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Bid</p>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Quote </span>
            <span className="font-semibold text-foreground tabular-nums">
              {totalInr > 0 ? formatInr(totalInr) : '—'}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Timeline </span>
            <span className="font-semibold text-foreground">{bid.timelineWeeks}w</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Material </span>
            <span className="font-semibold text-foreground capitalize">
              {(bid.materialQualityLevel ?? bid.materialLevel ?? '').toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Status message */}
      {!isActive && (
        <p className="text-xs text-muted-foreground">
          {isSelected
            ? '🎉 You were selected! Open the project to start the negotiation.'
            : bid.status === 'REJECTED'
            ? 'This project went to another vendor. Keep bidding on new projects.'
            : 'You withdrew this bid.'}
        </p>
      )}

      {isActive && (
        <p className="text-xs text-muted-foreground">
          {bid.status === 'SHORTLISTED'
            ? '⭐ You\'ve been shortlisted — final selection is coming soon.'
            : 'Your bid is under review. You\'ll be notified of any update.'}
        </p>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border p-5 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded-md bg-muted" />
          <div className="h-3 w-1/3 rounded-md bg-muted" />
        </div>
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-2/5 rounded-md bg-muted" />
        <div className="h-3 w-12 rounded-md bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible section header
// ---------------------------------------------------------------------------

function SectionHeader({
  title, count, open, onToggle, accent,
}: {
  title: string; count: number; open: boolean; onToggle: () => void; accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between py-1"
      aria-expanded={open}
    >
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-semibold', accent ? 'text-foreground' : 'text-muted-foreground')}>
          {title}
        </span>
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs font-semibold',
          accent ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground',
        )}>
          {count}
        </span>
      </div>
      {open
        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
        : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VendorBrowseProjectsPage() {
  const [search, setSearch]       = useState('');
  const [city, setCity]           = useState<string>('All');
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [showAlreadyBid, setShowAlreadyBid] = useState(true);

  const { data: projectsResult, isLoading: projectsLoading, isError } = useAvailableProjects(
    city !== 'All' ? { city } : undefined,
  );
  const { data: bidsResult, isLoading: bidsLoading } = useMyBids();

  const isLoading = projectsLoading || bidsLoading;

  const allProjects: Project[] = projectsResult?.data ?? (Array.isArray(projectsResult) ? projectsResult as Project[] : []);
  const myBids: Bid[] = bidsResult?.data ?? (Array.isArray(bidsResult) ? bidsResult as Bid[] : []);

  // Build a map of projectId → bid for O(1) lookup
  const bidByProjectId = useMemo(
    () => new Map(myBids.map((b) => [b.projectId, b])),
    [myBids],
  );

  const filtered = useMemo(() => {
    const band = BUDGET_BANDS[budgetIdx];
    return allProjects.filter((p) => {
      const budgetOk = !band || (band.min === 0 && band.max === Infinity) || (
        (p.budgetMax ?? 0) >= band.min && (p.budgetMin ?? 0) <= band.max
      );
      const searchOk = !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase());
      return budgetOk && searchOk;
    });
  }, [allProjects, budgetIdx, search]);

  // Split into open (no bid yet) and already bid
  const openProjects  = filtered.filter((p) => !bidByProjectId.has(p.id));
  const bidProjects   = filtered.filter((p) => bidByProjectId.has(p.id));

  return (
    <div className="space-y-6 animate-page-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Browse Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Projects in your service areas — bid anonymously with a professional BOQ.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5">
          <Link href="/vendor/bids">
            My Bids <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
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
      <Skeleton
        name="vendor-projects-grid"
        loading={isLoading}
        animate="shimmer"
        transition={300}
        fixture={
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          </div>
        }
      >
        {isError ? (
          <div className="rounded-2xl border border-dashed border-destructive/30 p-10 text-center">
            <p className="font-serif text-lg font-semibold text-foreground">Failed to load projects</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-serif text-lg font-semibold text-foreground">No projects found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters, or update your service areas in Settings.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/vendor/settings">Update Service Areas</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Open projects — primary section */}
            {openProjects.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">Open for Bidding</h2>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                    {openProjects.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {openProjects.map((project) => (
                    <OpenProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {/* Already bid section — collapsible */}
            {bidProjects.length > 0 && (
              <section>
                <div className="mb-4 border-t border-border pt-6">
                  <SectionHeader
                    title="Already Bid"
                    count={bidProjects.length}
                    open={showAlreadyBid}
                    onToggle={() => setShowAlreadyBid((v) => !v)}
                  />
                </div>
                {showAlreadyBid && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bidProjects.map((project) => {
                      const bid = bidByProjectId.get(project.id)!;
                      return (
                        <BidSubmittedCard key={project.id} project={project} bid={bid} />
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* No open projects but has bid projects */}
            {openProjects.length === 0 && bidProjects.length > 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden="true" />
                <p className="font-serif text-base font-semibold text-foreground">
                  You've bid on all available projects in your area
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check back soon — new projects are published regularly.
                </p>
              </div>
            )}
          </div>
        )}
      </Skeleton>
    </div>
  );
}
