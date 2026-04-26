'use client';

/**
 * ProjectClosure — final project completion flow.
 * 7.10: Project closure flow
 *
 * Shown when all milestones are RELEASED.
 * Customer confirms project complete → triggers rating form.
 */

import { useState } from 'react';
import { CheckCircle2, Star, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { RatingForm } from '@/components/rating/RatingForm';
import { useCloseProject } from '@/lib/api/chat';
import { useMilestones } from '@/lib/api/negotiation';
import { formatInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project.types';

interface ProjectClosureProps {
  project: Project;
  viewerRole: 'CUSTOMER' | 'VENDOR';
}

export function ProjectClosure({ project, viewerRole }: ProjectClosureProps) {
  const { data: milestones } = useMilestones(project.id);
  const closeProjectMutation = useCloseProject();

  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allReleased = milestones?.every((m) => m.escrowStatus === 'RELEASED') ?? false;
  const totalPaid = milestones?.reduce((s, m) => s + m.amountPaise, 0) ?? 0;
  const isCompleted = project.status === 'COMPLETED';

  const handleClose = async () => {
    setError(null);
    try {
      await closeProjectMutation.mutateAsync(project.id);
      setShowCloseDialog(false);
      setShowRating(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Failed to close project.');
    }
  };

  // Already completed — show rating + summary
  if (isCompleted) {
    return (
      <div className="space-y-5">
        {/* Completion banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
          <PartyPopper className="mx-auto mb-3 h-12 w-12 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h2 className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            Project Complete!
          </h2>
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            {project.title} has been successfully completed.
          </p>
          {totalPaid > 0 && (
            <p className="mt-3 font-serif text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatInr(totalPaid)} total paid
            </p>
          )}
        </div>

        {/* Rating */}
        <RatingForm projectId={project.id} viewerRole={viewerRole} />
      </div>
    );
  }

  // All milestones released but project not yet closed
  if (allReleased && viewerRole === 'CUSTOMER') {
    return (
      <>
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                All Milestones Complete
              </h3>
              <p className="text-sm text-muted-foreground">
                All escrow payments have been released. Ready to close the project.
              </p>
            </div>
          </div>

          {totalPaid > 0 && (
            <div className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total paid to vendor</span>
              <span className="font-serif text-xl font-bold text-accent">{formatInr(totalPaid)}</span>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={() => setShowCloseDialog(true)}
            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Project as Complete
          </Button>
        </div>

        {/* Close confirmation */}
        <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Mark Project as Complete?</DialogTitle>
              <DialogDescription>
                This will officially close the project. You&apos;ll then be asked to rate your experience.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloseDialog(false)} disabled={closeProjectMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleClose}
                disabled={closeProjectMutation.isPending}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {closeProjectMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Complete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rating dialog after closure */}
        <Dialog open={showRating} onOpenChange={setShowRating}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Rate Your Experience</DialogTitle>
              <DialogDescription>
                How was your experience working on this project?
              </DialogDescription>
            </DialogHeader>
            <RatingForm projectId={project.id} viewerRole={viewerRole} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Vendor view — show completion status
  if (viewerRole === 'VENDOR') {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-serif font-semibold text-foreground">Project Status</h3>
        <div className="space-y-2">
          {(milestones ?? []).map((ms) => (
            <div key={ms.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate">{ms.title}</span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ml-2',
                  ms.escrowStatus === 'RELEASED'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {ms.escrowStatus === 'RELEASED' ? '✓ Paid' : ms.escrowStatus}
              </span>
            </div>
          ))}
        </div>
        {isCompleted && (
          <div className="pt-2 border-t border-border/50">
            <RatingForm projectId={project.id} viewerRole={viewerRole} />
          </div>
        )}
      </div>
    );
  }

  return null;
}
