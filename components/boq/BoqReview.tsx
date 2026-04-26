'use client';

/**
 * BoqReview — customer-side read-only BOQ review with approve/request changes.
 * 6.7: Customer BOQ review (read-only, approve/request changes)
 */

import { useState } from 'react';
import { CheckCircle2, RefreshCw, Loader2, FileText, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { BoqRoomSection } from '@/components/boq/BoqRoomSection';
import { BoqSummary } from '@/components/boq/BoqSummary';
import { useBoq, useApproveBoq, useRequestBoqChanges } from '@/lib/api/boq';

interface BoqReviewProps {
  projectId: string;
}

export function BoqReview({ projectId }: BoqReviewProps) {
  const { data: boq, isLoading, error } = useBoq(projectId);
  const approveMutation = useApproveBoq();
  const requestChangesMutation = useRequestBoqChanges();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changesNote, setChangesNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Group items by room
  const roomGroups = boq
    ? boq.items.reduce<Record<string, typeof boq.items>>((acc, item) => {
        if (!acc[item.room]) acc[item.room] = [];
        acc[item.room]!.push(item);
        return acc;
      }, {})
    : {};

  const canApprove = boq?.status === 'SUBMITTED';

  const handleApprove = async () => {
    if (!boq) return;
    setActionError(null);
    try {
      await approveMutation.mutateAsync({ boqId: boq.id, projectId });
      setShowApproveDialog(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Failed to approve BOQ.');
    }
  };

  const handleRequestChanges = async () => {
    if (!boq) return;
    setActionError(null);
    try {
      await requestChangesMutation.mutateAsync({ boqId: boq.id, projectId });
      setShowChangesDialog(false);
      setChangesNote('');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Failed to request changes.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">Failed to load BOQ. Please refresh.</p>
      </div>
    );
  }

  if (!boq) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
        <h3 className="font-serif text-xl font-semibold text-foreground">
          BOQ not submitted yet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The vendor hasn&apos;t submitted a Bill of Quantities yet. You&apos;ll be notified when it&apos;s ready.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Bill of Quantities
            </h2>
            <p className="text-sm text-muted-foreground">
              {boq.items.length} items · {Object.keys(roomGroups).length} rooms
            </p>
          </div>

          {canApprove && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangesDialog(true)}
                className="gap-1.5 text-destructive hover:text-destructive hover:border-destructive/40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Request Changes
              </Button>
              <Button
                size="sm"
                onClick={() => setShowApproveDialog(true)}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve BOQ
              </Button>
            </div>
          )}
        </div>

        {/* Status banners */}
        {boq.status === 'DRAFT' && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              The vendor is still preparing the BOQ. You&apos;ll be notified when it&apos;s submitted.
            </p>
          </div>
        )}
        {boq.status === 'APPROVED' && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              You approved this BOQ. Waiting for vendor to lock it.
            </p>
          </div>
        )}
        {boq.status === 'LOCKED' && (
          <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm text-foreground">
              BOQ is locked and finalised. Proceed to fund milestones.
            </p>
          </div>
        )}
        {boq.status === 'CHANGES_REQUESTED' && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
            <RefreshCw className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              You requested changes. Waiting for vendor to update and resubmit.
            </p>
          </div>
        )}

        {actionError && (
          <p role="alert" className="text-sm text-destructive">{actionError}</p>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {Object.entries(roomGroups).map(([room, items]) => (
              <BoqRoomSection
                key={room}
                room={room}
                items={items}
                readOnly={true}
                onAddItem={() => {}}
                onUpdateItem={() => {}}
                onRemoveItem={() => {}}
              />
            ))}
          </div>

          <div className="xl:sticky xl:top-20 xl:self-start">
            <BoqSummary boq={boq} />
          </div>
        </div>
      </div>

      {/* Approve dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Approve BOQ?</DialogTitle>
            <DialogDescription>
              You are approving the Bill of Quantities. The vendor will then lock it
              and milestone funding will be enabled.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Grand total</span>
              <span className="font-serif font-bold text-accent">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(boq.grandTotalPaise / 100)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={approveMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {approveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Approve BOQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request changes dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Request Changes</DialogTitle>
            <DialogDescription>
              The vendor will be notified to revise the BOQ and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              What needs to be changed? (optional)
            </label>
            <textarea
              value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)}
              rows={3}
              placeholder="Describe the changes you need…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangesDialog(false)} disabled={requestChangesMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={requestChangesMutation.isPending}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {requestChangesMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
