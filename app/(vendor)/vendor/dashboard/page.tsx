'use client';

import Link from 'next/link';
import { Search, FileText, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useMyBids } from '@/lib/api/bidding';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInr } from '@/lib/utils/money';

const VENDOR_ID = 'usr_vend_001';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'hsl(217 65% 60%)',
  SHORTLISTED: 'hsl(40 45% 55%)',
  SELECTED: 'hsl(142 71% 45%)',
  REJECTED: 'hsl(0 0% 50%)',
  WITHDRAWN: 'hsl(0 0% 50%)',
};

export default function VendorDashboardPage() {
  const { user } = useAuthStore();
  const { data: bids, isLoading } = useMyBids(VENDOR_ID);

  const activeBids = bids?.filter((b) => b.status === 'PENDING' || b.status === 'SHORTLISTED') ?? [];
  const wonBids = bids?.filter((b) => b.status === 'SELECTED') ?? [];
  const totalQuoted = activeBids.reduce((s, b) => s + b.quotePaise, 0);

  const stats = [
    { label: 'Active Bids', value: activeBids.length, icon: FileText, color: 'hsl(217 65% 60%)' },
    { label: 'Projects Won', value: wonBids.length, icon: TrendingUp, color: 'hsl(142 71% 45%)' },
    { label: 'Total Quoted', value: formatInr(totalQuoted), icon: Clock, color: 'hsl(40 45% 55%)' },
  ];

  return (
    <div className="space-y-8 animate-page-in">
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ivory-card rounded-2xl p-5">
                <Skeleton className="h-8 w-8 rounded-xl mb-3" />
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          : stats.map((s) => (
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
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Recent Bids</h2>
          <Link href="/vendor/bids" className="text-sm text-accent hover:text-accent/80 underline underline-offset-2">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ivory-card rounded-xl p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : bids?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-serif text-lg font-semibold text-foreground">No bids yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse projects and submit your first bid.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids?.slice(0, 5).map((bid) => {
              const color = STATUS_COLORS[bid.status] ?? 'hsl(0 0% 50%)';
              return (
                <div key={bid.id} className="ivory-card rounded-xl p-4 flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-serif font-bold text-sm"
                    style={{ background: `${color}15`, color }}
                  >
                    {bid.anonymousLabel.slice(-1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      Project #{bid.projectId.slice(-6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatInr(bid.quotePaise)} · {bid.timelineWeeks}w
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold shrink-0"
                    style={{ background: `${color}15`, color }}
                  >
                    {bid.status.charAt(0) + bid.status.slice(1).toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
