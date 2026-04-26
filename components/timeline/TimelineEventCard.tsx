'use client';

/**
 * TimelineEventCard — individual timeline event with color-coded type.
 * 7.8: Timeline event cards (color-coded by type)
 */

import {
  FileText,
  Users,
  CheckCircle2,
  MessageSquare,
  Lock,
  IndianRupee,
  Send,
  RefreshCw,
  AlertTriangle,
  Star,
  Package,
  GitBranch,
  TrendingUp,
} from 'lucide-react';
import { formatInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType } from '@/types/timeline.types';

// ---------------------------------------------------------------------------
// Event type config
// ---------------------------------------------------------------------------

const EVENT_CONFIG: Record<
  TimelineEventType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  PROJECT_CREATED: { icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  PROJECT_PUBLISHED: { icon: Send, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  BID_RECEIVED: { icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  VENDOR_SELECTED: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  NEGOTIATION_CONFIRMED: { icon: MessageSquare, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  MILESTONE_LOCKED: { icon: Lock, color: 'text-accent', bg: 'bg-accent/10' },
  ESCROW_FUNDED: { icon: IndianRupee, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  MILESTONE_SUBMITTED: { icon: Send, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  MILESTONE_APPROVED: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  MILESTONE_CHANGES_REQUESTED: { icon: RefreshCw, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  DISPUTE_RAISED: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  DISPUTE_RESOLVED: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  BOQ_SUBMITTED: { icon: Package, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  BOQ_APPROVED: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  BOQ_LOCKED: { icon: Lock, color: 'text-accent', bg: 'bg-accent/10' },
  VARIATION_RAISED: { icon: GitBranch, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  VARIATION_APPROVED: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  PROJECT_COMPLETED: { icon: Star, color: 'text-accent', bg: 'bg-accent/10' },
  RATING_SUBMITTED: { icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
};

// ---------------------------------------------------------------------------
// TimelineEventCard
// ---------------------------------------------------------------------------

interface TimelineEventCardProps {
  event: TimelineEvent;
  /** Whether this is the first event (most recent) */
  isFirst?: boolean;
}

export function TimelineEventCard({ event, isFirst = false }: TimelineEventCardProps) {
  const cfg = EVENT_CONFIG[event.type];
  const Icon = cfg.icon;

  const date = new Date(event.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="relative flex items-start gap-4">
      {/* Timeline line (not for first) */}
      {!isFirst && (
        <div className="absolute left-[1.125rem] top-0 bottom-0 w-px bg-border/50" aria-hidden="true" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          cfg.bg,
        )}
      >
        <Icon className={cn('h-4 w-4', cfg.color)} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{event.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
            {event.metadata && (
              <div className="mt-2 flex flex-wrap gap-2">
                {event.metadata.amountPaise && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    {formatInr(event.metadata.amountPaise as number)}
                  </span>
                )}
                {event.metadata.bidCount && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {event.metadata.bidCount} bids
                  </span>
                )}
                {event.metadata.milestoneCount && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {event.metadata.milestoneCount} milestones
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">{dateStr}</p>
            <p className="text-[10px] text-muted-foreground/60">{timeStr}</p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <span className="font-medium">{event.actor}</span>
          <span>·</span>
          <span className="capitalize">{event.actorRole.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
}
