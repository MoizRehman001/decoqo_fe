'use client';

import Link from 'next/link';
import {
  FolderPlus,
  Gavel,
  UserCheck,
  CheckSquare,
  CreditCard,
  Trophy,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ActivityEvent } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const EVENT_CONFIG: Record<
  ActivityEvent['type'],
  { icon: React.ElementType; iconClassName: string; bgClassName: string }
> = {
  PROJECT_CREATED: {
    icon: FolderPlus,
    iconClassName: 'text-accent',
    bgClassName: 'bg-accent/10',
  },
  BID_RECEIVED: {
    icon: Gavel,
    iconClassName: 'text-blue-500',
    bgClassName: 'bg-blue-500/10',
  },
  VENDOR_SELECTED: {
    icon: UserCheck,
    iconClassName: 'text-purple-500',
    bgClassName: 'bg-purple-500/10',
  },
  MILESTONE_COMPLETED: {
    icon: CheckSquare,
    iconClassName: 'text-amber-500',
    bgClassName: 'bg-amber-500/10',
  },
  PAYMENT_RELEASED: {
    icon: CreditCard,
    iconClassName: 'text-green-500',
    bgClassName: 'bg-green-500/10',
  },
  PROJECT_COMPLETED: {
    icon: Trophy,
    iconClassName: 'text-accent',
    bgClassName: 'bg-accent/10',
  },
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function RecentActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RecentActivityProps {
  events: ActivityEvent[];
}

export function RecentActivity({ events }: RecentActivityProps) {
  if (events.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first project to get started.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-4" aria-label="Recent activity">
      {events.map((event) => {
        const config = EVENT_CONFIG[event.type];
        const Icon = config.icon;

        return (
          <li key={event.id} className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                config.bgClassName,
              )}
              aria-hidden="true"
            >
              <Icon className={cn('h-4 w-4', config.iconClassName)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground leading-snug">{event.message}</p>
              <Link
                href={`/customer/projects/${event.projectId}`}
                className="mt-0.5 block truncate text-xs text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
              >
                {event.projectTitle}
              </Link>
            </div>
            <time
              dateTime={event.timestamp}
              className="shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {formatRelativeTime(event.timestamp)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
