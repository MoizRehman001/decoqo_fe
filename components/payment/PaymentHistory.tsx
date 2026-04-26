'use client';

/**
 * PaymentHistory — chronological list of escrow transactions.
 * 6.15: Payment history page
 */

import { ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInr } from '@/lib/utils/money';
import { usePaymentHistory } from '@/lib/api/boq';
import { cn } from '@/lib/utils';
import type { PaymentHistoryItem } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Transaction type config
// ---------------------------------------------------------------------------

const TX_CONFIG: Record<
  PaymentHistoryItem['type'],
  { label: string; icon: React.ElementType; color: string; bg: string; sign: string }
> = {
  ESCROW_FUNDED: {
    label: 'Escrow Funded',
    icon: ArrowUpRight,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    sign: '-',
  },
  ESCROW_RELEASED: {
    label: 'Escrow Released',
    icon: ArrowDownLeft,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    sign: '+',
  },
  ESCROW_REFUNDED: {
    label: 'Escrow Refunded',
    icon: RefreshCw,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    sign: '+',
  },
};

// ---------------------------------------------------------------------------
// PaymentHistoryRow
// ---------------------------------------------------------------------------

function PaymentHistoryRow({ item }: { item: PaymentHistoryItem }) {
  const cfg = TX_CONFIG[item.type];
  const Icon = cfg.icon;
  const date = new Date(item.createdAt);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/20">
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          cfg.bg,
        )}
      >
        <Icon className={cn('h-5 w-5', cfg.color)} aria-hidden="true" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.milestoneTitle}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
              cfg.bg,
              cfg.color,
            )}
          >
            {cfg.label}
          </span>
          {item.razorpayPaymentId && (
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              {item.razorpayPaymentId}
            </span>
          )}
        </div>
      </div>

      {/* Amount + date */}
      <div className="text-right shrink-0">
        <p
          className={cn(
            'font-serif text-base font-bold tabular-nums',
            cfg.sign === '-' ? 'text-foreground' : 'text-emerald-600 dark:text-emerald-400',
          )}
        >
          {cfg.sign}{formatInr(item.amountPaise)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PaymentHistory
// ---------------------------------------------------------------------------

interface PaymentHistoryProps {
  projectId: string;
}

export function PaymentHistory({ projectId }: PaymentHistoryProps) {
  const { data: payments, isLoading, error } = usePaymentHistory(projectId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load payment history. Please refresh.
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
        <p className="font-serif text-lg font-semibold text-foreground">No transactions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment history will appear here once milestones are funded.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalFunded = payments
    .filter((p) => p.type === 'ESCROW_FUNDED')
    .reduce((s, p) => s + p.amountPaise, 0);
  const totalReleased = payments
    .filter((p) => p.type === 'ESCROW_RELEASED')
    .reduce((s, p) => s + p.amountPaise, 0);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Funded</p>
          <p className="mt-1 font-serif text-xl font-bold tabular-nums text-foreground">
            {formatInr(totalFunded)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Released</p>
          <p className="mt-1 font-serif text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatInr(totalReleased)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">In Escrow</p>
          <p className="mt-1 font-serif text-xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {formatInr(Math.max(0, totalFunded - totalReleased))}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {payments
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((item) => (
            <PaymentHistoryRow key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
}
