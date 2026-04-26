'use client';

/**
 * BoqEditor — vendor-side BOQ editor shell.
 * 6.1: Create, edit, submit BOQ
 * 6.5: Optimistic updates for item changes
 * 6.6: Submit + lock flow
 *
 * State machine:
 *   null → create BOQ → DRAFT → edit items → SUBMITTED → customer approves → APPROVED → lock → LOCKED
 *
 * Optimistic updates:
 *   - Item amount recalculates instantly in BoqItemRow
 *   - useUpdateBoqItem has onMutate optimistic update in lib/api/boq.ts
 */

import { useState, useMemo } from 'react';
import {
  Plus,
  Send,
  Lock,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
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
import { AddItemDialog } from '@/components/boq/AddItemDialog';
import {
  useBoq,
  useCreateBoq,
  useAddBoqItem,
  useUpdateBoqItem,
  useRemoveBoqItem,
  useSubmitBoq,
  useLockBoq,
} from '@/lib/api/boq';
import { cn } from '@/lib/utils';
import type { BoqItemRowChanges } from '@/components/boq/BoqItemRow';

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const EDITABLE_STATUSES = new Set(['DRAFT', 'CHANGES_REQUESTED']);

// ---------------------------------------------------------------------------
// BoqEditor
// ---------------------------------------------------------------------------

interface BoqEditorProps {
  projectId: string;
  /** Rooms from the project — used to pre-populate room options */
  projectRooms?: string[];
}

export function BoqEditor({ projectId, projectRooms = [] }: BoqEditorProps) {
  const { data: boq, isLoading, error } = useBoq(projectId);
  const createBoqMutation = useCreateBoq();
  const addItemMutation = useAddBoqItem();
  const updateItemMutation = useUpdateBoqItem();
  const removeItemMutation = useRemoveBoqItem();
  const submitMutation = useSubmitBoq();
  const lockMutation = useLockBoq();

  const [addItemRoom, setAddItemRoom] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Group items by room
  const roomGroups = useMemo(() => {
    if (!boq) return {};
    return boq.items.reduce<Record<string, typeof boq.items>>((acc, item) => {
      if (!acc[item.room]) acc[item.room] = [];
      acc[item.room]!.push(item);
      return acc;
    }, {});
  }, [boq]);

  // All rooms: from project + from existing BOQ items
  const allRooms = useMemo(() => {
    const fromBoq = Object.keys(roomGroups);
    const combined = [...new Set([...projectRooms, ...fromBoq])];
    return combined.length > 0 ? combined : ['General'];
  }, [roomGroups, projectRooms]);

  const isEditable = boq ? EDITABLE_STATUSES.has(boq.status) : false;
  const canSubmit = boq && isEditable && boq.items.length > 0;
  const canLock = boq?.status === 'APPROVED';

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreateBoq = async () => {
    setActionError(null);
    try {
      await createBoqMutation.mutateAsync(projectId);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Failed to create BOQ.');
    }
  };

  const handleAddItem = async (payload: Parameters<typeof addItemMutation.mutateAsync>[0]) => {
    await addItemMutation.mutateAsync({ ...payload, projectId });
  };

  const handleUpdateItem = (itemId: string, changes: BoqItemRowChanges) => {
    if (!boq) return;
    updateItemMutation.mutate({
      itemId,
      boqId: boq.id,
      projectId,
      ...changes,
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!boq) return;
    setRemovingItemId(itemId);
    try {
      await removeItemMutation.mutateAsync({ boqId: boq.id, itemId, projectId });
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleSubmit = async () => {
    if (!boq) return;
    setActionError(null);
    try {
      await submitMutation.mutateAsync({ boqId: boq.id, projectId });
      setShowSubmitDialog(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Failed to submit BOQ.');
    }
  };

  const handleLock = async () => {
    if (!boq) return;
    setActionError(null);
    try {
      await lockMutation.mutateAsync({ boqId: boq.id, projectId });
      setShowLockDialog(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Failed to lock BOQ.');
    }
  };

  // ---------------------------------------------------------------------------
  // Loading / Error states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
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

  // ---------------------------------------------------------------------------
  // No BOQ yet — create prompt
  // ---------------------------------------------------------------------------

  if (!boq) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
        <h3 className="font-serif text-xl font-semibold text-foreground">
          No Bill of Quantities yet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Create a BOQ to itemise all work, materials, and costs for this project.
          The customer will review and approve before work begins.
        </p>
        {actionError && (
          <p className="mt-3 text-sm text-destructive">{actionError}</p>
        )}
        <Button
          onClick={handleCreateBoq}
          disabled={createBoqMutation.isPending}
          className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {createBoqMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create BOQ
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // BOQ exists — editor
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Bill of Quantities
            </h2>
            <p className="text-sm text-muted-foreground">
              {boq.items.length} items · {Object.keys(roomGroups).length} rooms
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Add item to first room */}
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddItemRoom(allRooms[0] ?? 'General')}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            )}

            {/* Submit */}
            {canSubmit && (
              <Button
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Send className="h-3.5 w-3.5" />
                Submit for Review
              </Button>
            )}

            {/* Lock (after customer approval) */}
            {canLock && (
              <Button
                size="sm"
                onClick={() => setShowLockDialog(true)}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Lock className="h-3.5 w-3.5" />
                Lock BOQ
              </Button>
            )}
          </div>
        </div>

        {/* Status banners */}
        {boq.status === 'SUBMITTED' && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
            <RefreshCw className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              BOQ submitted. Awaiting customer review and approval.
            </p>
          </div>
        )}
        {boq.status === 'APPROVED' && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              BOQ approved by customer. Lock it to finalise and begin milestone funding.
            </p>
          </div>
        )}
        {boq.status === 'LOCKED' && (
          <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm text-foreground">
              BOQ is locked. No further edits are allowed.
            </p>
          </div>
        )}
        {boq.status === 'CHANGES_REQUESTED' && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">
              Customer has requested changes. Please update the BOQ and resubmit.
            </p>
          </div>
        )}

        {actionError && (
          <p role="alert" className="text-sm text-destructive">{actionError}</p>
        )}

        {/* Two-column layout: rooms + summary */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          {/* Room sections */}
          <div className="space-y-4">
            {allRooms.map((room) => (
              <BoqRoomSection
                key={room}
                room={room}
                items={roomGroups[room] ?? []}
                readOnly={!isEditable}
                onAddItem={(r) => setAddItemRoom(r)}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                removingItemId={removingItemId}
              />
            ))}

            {/* Add new room */}
            {isEditable && (
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt('Enter room name:');
                  if (name?.trim()) setAddItemRoom(name.trim());
                }}
                className={cn(
                  'w-full rounded-2xl border border-dashed border-border/60 py-4 text-sm',
                  'text-muted-foreground hover:text-accent hover:border-accent/40 hover:bg-accent/5',
                  'transition-all duration-150',
                )}
              >
                <Plus className="mx-auto mb-1 h-4 w-4" />
                Add new room
              </button>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="xl:sticky xl:top-20 xl:self-start">
            <BoqSummary boq={boq} />
          </div>
        </div>
      </div>

      {/* Add item dialog */}
      {addItemRoom !== null && boq && (
        <AddItemDialog
          open={addItemRoom !== null}
          defaultRoom={addItemRoom}
          boqId={boq.id}
          onClose={() => setAddItemRoom(null)}
          onAdd={handleAddItem}
        />
      )}

      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Submit BOQ for Review?</DialogTitle>
            <DialogDescription>
              The customer will be notified to review and approve the BOQ.
              You can still make changes if they request revisions.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total items</span>
              <span className="font-medium">{boq.items.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Grand total</span>
              <span className="font-serif font-bold text-accent">
                {boq.grandTotalPaise > 0
                  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(boq.grandTotalPaise / 100)
                  : '—'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} disabled={submitMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit BOQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock confirmation dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Lock BOQ?</DialogTitle>
            <DialogDescription>
              Locking the BOQ is irreversible. No further edits will be allowed.
              Milestone funding will be enabled after locking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockDialog(false)} disabled={lockMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleLock}
              disabled={lockMutation.isPending}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {lockMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Lock BOQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
