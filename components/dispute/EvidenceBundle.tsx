'use client';

/**
 * EvidenceBundle — admin-side viewer showing all evidence across milestones.
 * 7.6: EvidenceBundle viewer (admin side)
 *
 * Shows all milestone evidence grouped by milestone, with dispute context.
 */

import { useState } from 'react';
import Image from 'next/image';
import {
  FolderOpen,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMilestones } from '@/lib/api/negotiation';
import { cn } from '@/lib/utils';
import type { MilestoneEvidence } from '@/types/negotiation.types';

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

interface LightboxProps {
  images: MilestoneEvidence[];
  startIndex: number;
  onClose: () => void;
}

function Lightbox({ images, startIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex);
  const current = images[idx];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Evidence lightbox"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {idx > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => i - 1); }}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {current && (
          <>
            <Image
              src={current.fileUrl}
              alt={current.fileName}
              width={1000}
              height={750}
              className="object-contain max-h-[85vh] max-w-[90vw]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 text-xs text-white/80">
              {current.fileName} · {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {idx < images.length - 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => i + 1); }}
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EvidenceBundle
// ---------------------------------------------------------------------------

interface EvidenceBundleProps {
  projectId: string;
  /** Highlight milestones with disputes */
  disputedMilestoneIds?: string[];
}

export function EvidenceBundle({ projectId, disputedMilestoneIds = [] }: EvidenceBundleProps) {
  const { data: milestones, isLoading } = useMilestones(projectId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ images: MilestoneEvidence[]; startIndex: number } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const milestonesWithEvidence = (milestones ?? []).filter((m) => m.evidence.length > 0);
  const totalEvidence = milestonesWithEvidence.reduce((s, m) => s + m.evidence.length, 0);

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-accent" aria-hidden="true" />
          <h3 className="font-serif font-semibold text-foreground">Evidence Bundle</h3>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {totalEvidence} files across {milestonesWithEvidence.length} milestones
          </span>
        </div>

        {milestonesWithEvidence.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <FolderOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No evidence uploaded yet.</p>
          </div>
        ) : (
          milestonesWithEvidence.map((milestone) => {
            const isDisputed = disputedMilestoneIds.includes(milestone.id);
            const isExpanded = expandedIds.has(milestone.id);

            return (
              <div
                key={milestone.id}
                className={cn(
                  'overflow-hidden rounded-xl border bg-card',
                  isDisputed ? 'border-destructive/40' : 'border-border',
                )}
              >
                {/* Milestone header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(milestone.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                  aria-expanded={isExpanded}
                >
                  {isDisputed && (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {milestone.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {milestone.evidence.length} file{milestone.evidence.length !== 1 ? 's' : ''}
                      {isDisputed && (
                        <span className="ml-2 text-destructive font-medium">· Disputed</span>
                      )}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {/* Evidence grid */}
                {isExpanded && (
                  <div className="border-t border-border/50 p-4">
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {milestone.evidence.map((ev, i) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() =>
                            setLightbox({ images: milestone.evidence, startIndex: i })
                          }
                          className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-accent/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          aria-label={`View ${ev.fileName}`}
                        >
                          <Image
                            src={ev.fileUrl}
                            alt={ev.fileName}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 space-y-1">
                      {milestone.evidence.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="truncate">{ev.fileName}</span>
                          <span className="shrink-0 ml-2">
                            {new Date(ev.uploadedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
