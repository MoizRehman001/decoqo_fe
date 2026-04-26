'use client';

import Link from 'next/link';
import { Search, FileText, TrendingUp, IndianRupee } from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useMyBids } from '@/lib/api/bidding';
import { formatInr } from '@/lib/utils/money';
import type { Bid } from '@/types/bidding.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  PENDING:     'hsl(217 65% 60%)',
  SHORTLISTED: 'hsl(40 45% 55%)',
  SELECTED:    'hsl(142 71% 45%)',
  REJECTED:    'hsl(0 0% 50%)',
  WITHDRAWN:   'hsl(0 0% 50%)',
};

// ---------------------------------------------------------------------------
// Skeleton fixture
// ---------------------------------------------------------------------------

function DashboardFixture() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="ivory-card rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="h-7 w-16 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ivory-card rounded-xl p-4 flex items-center gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VendorDashboardPage() {
  const { user } = useAuthStore();

  // Real API — GET /api/v1/bids/mine (uses JWT, no userId param needed)
  const { data: bidsResult, isLoading } = useMyBids();

  const bids: Bid[] = bidsResult?.data ?? (Array.isArray(bidsResult) ? bidsResult as Bid[] : []);

  const activeBids  = bids.filter((b) => b.status === 'PENDING' || b.status === 'SHORTLISTED');
  const wonBids     = bids.filter((b) => b.status === 'SELECTED');
  const totalQuoted = activeBids.reduce((s, b) => s + (b.quotePaise ?? 0), 0);

  const stats = [
    { label: 'Active Bids',    value: String(activeBids.length),  icon: FileText,    color: 'hsl(217 65% 60%)' },
    { label: 'Projects Won',   value: String(wonBids.length),     icon: TrendingUp,  color: 'hsl(142 71% 45%)' },
    { label: 'Total Quoted',   value: formatInr(totalQuoted),     icon: IndianRupee, color: 'hsl(40 45% 55%)' },
  ];

  return (
    <div className="space-y-8 animate-page-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Your vendor dashboard</p>
        </div>
        <Link
          href="/vendor/projects"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shrink-0"
          style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Browse Projects
        </Link>
      </div>

      {/* Boneyard skeleton wraps stats + bids */}
      <Skeleton
        name="vendor-dashboard"
        loading={isLoading}
        animate="shimmer"
        transition={300}
        fixture={<DashboardFixture />}
      >
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="ivory-card rounded-2xl p-5">
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${s.color}15`, color: s.color }}
              >
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="font-serif text-2xl font-bold text-foreground">{s.value}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent bids */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">Recent Bids</h2>
            <Link
              href="/vendor/bids"
              className="text-sm text-accent underline underline-offset-2 hover:text-accent/80"
            >
              View all
            </Link>
          </div>

          {bids.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-serif text-lg font-semibold text-foreground">No bids yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse projects and submit your first bid.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bids.slice(0, 5).map((bid) => {
                const color = STATUS_COLORS[bid.status] ?? 'hsl(0 0% 50%)';
                return (
                  <Link
                    key={bid.id}
                    href={`/vendor/projects/${bid.projectId}`}
                    className="ivory-card flex items-center gap-4 rounded-xl p-4 transition-all hover:-translate-y-0.5"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-serif text-sm font-bold"
                      style={{ background: `${color}15`, color }}
                    >
                      {(bid.anonymousLabel ?? 'B').slice(-1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        Project #{bid.projectId.slice(-6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatInr(bid.quotePaise ?? 0)} · {bid.timelineWeeks}w
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: `${color}15`, color }}
                    >
                      {bid.status.charAt(0) + bid.status.slice(1).toLowerCase()}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </Skeleton>
    </div>
  );
}
