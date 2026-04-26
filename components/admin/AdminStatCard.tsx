'use client';

/**
 * AdminStatCard — metric card with trend indicator for admin dashboard.
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStatCardProps {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  color: string;
  description?: string;
}

export function AdminStatCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  color,
  description,
}: AdminStatCardProps) {
  const isPositive = (trend ?? 0) > 0;
  const isNegative = (trend ?? 0) < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="ivory-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}18`, color }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              isPositive && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
              isNegative && 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
              !isPositive && !isNegative && 'bg-muted text-muted-foreground',
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {Math.abs(trend)}{trendLabel ?? '%'}
          </div>
        )}
      </div>
      <div>
        <p className="font-serif text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground/60">{description}</p>
        )}
      </div>
    </div>
  );
}
