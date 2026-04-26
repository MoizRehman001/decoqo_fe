'use client';

/**
 * BoqVersionHistory — timeline of BOQ snapshots.
 * 6.11: BOQ version history viewer
 */

import { History, GitCommit } from 'lucide-react';
import { formatInr } from '@/lib/utils/money';
import type { BoqVersion } from '@/types/boq.types';

interface BoqVersionHistoryProps {
  versions: BoqVersion[];
}

export function BoqVersionHistory({ versions }: BoqVersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <History className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No version history yet.</p>
      </div>
    );
  }

  const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <History className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="font-serif font-semibold text-foreground">Version History</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      <div className="relative px-5 py-4">
        {/* Timeline line */}
        <div className="absolute left-[2.125rem] top-4 bottom-4 w-px bg-border/50" aria-hidden="true" />

        <div className="space-y-4">
          {sorted.map((version, idx) => {
            const isLatest = idx === 0;
            const date = new Date(version.snapshotAt);

            return (
              <div key={version.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isLatest
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  <GitCommit className="h-3 w-3" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          Version {version.versionNumber}
                        </span>
                        {isLatest && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{version.reason}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                        {date.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 font-serif text-sm font-bold tabular-nums text-foreground">
                      {formatInr(version.totalAmountPaise)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
