'use client';

/**
 * ProjectTimeline — chronological event list for a project.
 * 7.7: ProjectTimeline (chronological event list)
 */

import { Clock, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TimelineEventCard } from '@/components/timeline/TimelineEventCard';
import { useProjectTimeline } from '@/lib/api/chat';

interface ProjectTimelineProps {
  projectId: string;
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const { data: events, isLoading, error } = useProjectTimeline(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2 pb-6">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load timeline. Please refresh.
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
        <p className="font-serif text-lg font-semibold text-foreground">No events yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Project activity will appear here as it progresses.
        </p>
      </div>
    );
  }

  // Show most recent first
  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="font-serif font-semibold text-foreground">Project Timeline</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {events.length} events
        </span>
      </div>

      {/* Events */}
      <div className="px-5 py-4">
        {sorted.map((event, i) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            isFirst={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
