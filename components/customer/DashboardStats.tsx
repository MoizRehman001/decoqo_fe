'use client';

import { FolderOpen, Gavel, Clock, IndianRupee, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function TrendIndicator({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" aria-hidden="true" />
        No change
      </span>
    );
  }
  const isPositive = value > 0;
  return (
    <span
      className={cn(
        'flex items-center gap-0.5 text-xs font-medium',
        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400',
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
      )}
      {isPositive ? '+' : ''}{value}%
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: number;
  iconClassName?: string;
}

function StatCard({ icon: Icon, label, value, trend, iconClassName }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="icon-container flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon className={cn('h-5 w-5', iconClassName ?? 'text-accent')} aria-hidden="true" />
        </div>
        <TrendIndicator value={trend} />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStatsGrid({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="list" aria-label="Dashboard statistics">
      <div role="listitem">
        <StatCard
          icon={FolderOpen}
          label="Total Projects"
          value={String(stats.totalProjects)}
          trend={stats.projectsTrend}
          iconClassName="text-accent"
        />
      </div>
      <div role="listitem">
        <StatCard
          icon={Gavel}
          label="Active Bids"
          value={String(stats.activeBids)}
          trend={stats.bidsTrend}
          iconClassName="text-blue-500"
        />
      </div>
      <div role="listitem">
        <StatCard
          icon={Clock}
          label="Pending Approvals"
          value={String(stats.pendingApprovals)}
          trend={stats.approvalsTrend}
          iconClassName="text-amber-500"
        />
      </div>
      <div role="listitem">
        <StatCard
          icon={IndianRupee}
          label="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          trend={stats.spentTrend}
          iconClassName="text-green-500"
        />
      </div>
    </div>
  );
}
