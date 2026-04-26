'use client';

/**
 * BoqSummary — room-wise totals + grand total + status badge.
 * 6.4: Room totals, grand total, status display
 */

import { IndianRupee, TrendingUp, CheckCircle2, Lock, Clock, AlertCircle } from 'lucide-react';
import { formatInr, formatInrCompact } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { Boq, BoqStatus } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  BoqStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-muted-foreground',
    bg: 'bg-muted/40',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Submitted — Awaiting Approval',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: CheckCircle2,
  },
  LOCKED: {
    label: 'Locked',
    color: 'text-accent',
    bg: 'bg-accent/10',
    icon: Lock,
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    icon: AlertCircle,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BoqSummaryProps {
  boq: Boq;
  /** Show compact version (for sidebar/header) */
  compact?: boolean;
}

export function BoqSummary({ boq, compact = false }: BoqSummaryProps) {
  const statusCfg = STATUS_CONFIG[boq.status];
  const StatusIcon = statusCfg.icon;

  // Group items by room and calculate room totals
  const roomTotals = boq.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.room] = (acc[item.room] ?? 0) + item.amountPaise;
    return acc;
  }, {});

  const rooms = Object.entries(roomTotals).sort(([, a], [, b]) => b - a);

  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">BOQ Total</span>
          </div>
          <span className="font-serif text-lg font-bold text-accent tabular-nums">
            {boq.grandTotalPaise > 0 ? formatInrCompact(boq.grandTotalPaise) : '—'}
          </span>
        </div>
        <div
          className={cn(
            'mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
            statusCfg.bg,
            statusCfg.color,
          )}
        >
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {statusCfg.label}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
          <h3 className="font-serif font-semibold text-foreground">BOQ Summary</h3>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            statusCfg.bg,
            statusCfg.color,
          )}
        >
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {statusCfg.label}
        </div>
      </div>

      {/* Room breakdown */}
      {rooms.length > 0 && (
        <div className="px-5 py-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Room Breakdown
          </p>
          {rooms.map(([room, total]) => {
            const pct = boq.grandTotalPaise > 0
              ? Math.round((total / boq.grandTotalPaise) * 100)
              : 0;
            return (
              <div key={room} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{room}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatInr(total)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-accent/60 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grand total */}
      <div className="border-t border-border/50 bg-accent/5 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Grand Total</p>
            <p className="text-[10px] text-muted-foreground/60">
              {boq.items.length} items across {rooms.length} rooms
            </p>
          </div>
          <div className="text-right">
            <p className="font-serif text-2xl font-bold text-accent tabular-nums">
              {boq.grandTotalPaise > 0 ? formatInr(boq.grandTotalPaise) : '—'}
            </p>
            {boq.grandTotalPaise > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatInrCompact(boq.grandTotalPaise)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Version info */}
      {boq.versions.length > 0 && (
        <div className="border-t border-border/50 px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
            Version History
          </p>
          <div className="space-y-1">
            {boq.versions.slice(-3).reverse().map((v) => (
              <div key={v.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  v{v.versionNumber} — {v.reason}
                </span>
                <span className="tabular-nums text-foreground font-medium">
                  {formatInr(v.totalAmountPaise)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
