'use client';

/**
 * VariationDiff — side-by-side comparison of old vs new BOQ values.
 * 6.8: Old vs new side-by-side comparison for variations
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { Variation, VariationItem } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Diff row
// ---------------------------------------------------------------------------

interface DiffRowProps {
  item: VariationItem;
}

function DiffRow({ item }: DiffRowProps) {
  const oldAmount = item.oldRatePaise * item.oldQuantity;
  const newAmount = item.newRatePaise * item.newQuantity;
  const delta = newAmount - oldAmount;
  const isIncrease = delta > 0;
  const isDecrease = delta < 0;
  const isUnchanged = delta === 0;

  const DeltaIcon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Item description */}
      <div className="border-b border-border/50 px-4 py-2.5 bg-muted/20">
        <p className="text-sm font-medium text-foreground">{item.description}</p>
      </div>

      {/* Comparison grid */}
      <div className="grid grid-cols-3 divide-x divide-border/50">
        {/* Old values */}
        <div className="px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Before
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Qty</span>
              <span className="tabular-nums text-foreground">{item.oldQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="tabular-nums text-foreground">{formatInr(item.oldRatePaise)}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1">
              <span className="text-muted-foreground font-medium">Amount</span>
              <span className="tabular-nums font-semibold text-foreground">{formatInr(oldAmount)}</span>
            </div>
          </div>
        </div>

        {/* New values */}
        <div className="px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            After
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Qty</span>
              <span
                className={cn(
                  'tabular-nums',
                  item.newQuantity !== item.oldQuantity ? 'font-semibold text-accent' : 'text-foreground',
                )}
              >
                {item.newQuantity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span
                className={cn(
                  'tabular-nums',
                  item.newRatePaise !== item.oldRatePaise ? 'font-semibold text-accent' : 'text-foreground',
                )}
              >
                {formatInr(item.newRatePaise)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1">
              <span className="text-muted-foreground font-medium">Amount</span>
              <span className="tabular-nums font-semibold text-accent">{formatInr(newAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delta */}
        <div className="px-4 py-3 flex flex-col items-center justify-center">
          <DeltaIcon
            className={cn(
              'h-5 w-5 mb-1',
              isIncrease && 'text-destructive',
              isDecrease && 'text-emerald-500',
              isUnchanged && 'text-muted-foreground',
            )}
            aria-hidden="true"
          />
          <p
            className={cn(
              'text-sm font-bold tabular-nums',
              isIncrease && 'text-destructive',
              isDecrease && 'text-emerald-500',
              isUnchanged && 'text-muted-foreground',
            )}
          >
            {isUnchanged ? 'No change' : `${isIncrease ? '+' : ''}${formatInr(delta)}`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VariationDiff
// ---------------------------------------------------------------------------

interface VariationDiffProps {
  variation: Variation;
}

export function VariationDiff({ variation }: VariationDiffProps) {
  const isPositive = variation.type === 'POSITIVE';

  const STATUS_CONFIG = {
    PENDING: { label: 'Pending Approval', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    APPROVED: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    REJECTED: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  const statusCfg = STATUS_CONFIG[variation.status];

  return (
    <div className="space-y-3">
      {/* Variation header */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-bold',
                isPositive
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
              )}
            >
              {isPositive ? '↑ Cost Increase' : '↓ Cost Reduction'}
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                statusCfg.bg,
                statusCfg.color,
              )}
            >
              {statusCfg.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-foreground">{variation.reason}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(variation.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Change</p>
          <p
            className={cn(
              'font-serif text-xl font-bold tabular-nums',
              variation.deltaAmountPaise > 0 ? 'text-destructive' : 'text-emerald-500',
            )}
          >
            {variation.deltaAmountPaise > 0 ? '+' : ''}
            {formatInr(variation.deltaAmountPaise)}
          </p>
        </div>
      </div>

      {/* Item diffs */}
      <div className="space-y-2">
        {variation.affectedItems.map((item) => (
          <DiffRow key={item.itemId} item={item} />
        ))}
      </div>
    </div>
  );
}
