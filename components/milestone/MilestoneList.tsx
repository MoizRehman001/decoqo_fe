'use client';

/**
 * MilestoneList — full milestone management with creation form and lock flow.
 * CUST-60: Milestone list with percentage, amount, status badges
 * CUST-67: Milestone percentage total must equal 100% (real-time validation)
 * 5.11: Lock All Milestones confirmation flow
 */

import { useState } from 'react';
import { Plus, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { MilestoneCard } from '@/components/milestone/MilestoneCard';
import { useMilestones, useCreateMilestone, useLockMilestones } from '@/lib/api/negotiation';
import { cn } from '@/lib/utils';

interface MilestoneListProps {
  projectId: string;
  viewerRole: 'CUSTOMER' | 'VENDOR';
}

export function MilestoneList({ projectId, viewerRole }: MilestoneListProps) {
  const { data: milestones, isLoading } = useMilestones(projectId);
  const createMutation = useCreateMilestone();
  const lockMutation = useLockMilestones();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPct, setNewPct] = useState('');
  const [formError, setFormError] = useState('');

  const totalPct = (milestones ?? []).reduce((s, m) => s + m.percentageOfTotal, 0);
  const remaining = 100 - totalPct;
  const allLocked = milestones?.every((m) => m.status !== 'DRAFT') ?? false;
  const canLock = viewerRole === 'VENDOR' && totalPct === 100 && !allLocked;

  const handleAdd = async () => {
    setFormError('');
    const pct = parseInt(newPct, 10);
    if (!newTitle.trim()) { setFormError('Title is required'); return; }
    if (isNaN(pct) || pct <= 0 || pct > 100) { setFormError('Percentage must be between 1 and 100'); return; }
    if (pct > remaining) { setFormError(`Only ${remaining}% remaining`); return; }
    try {
      await createMutation.mutateAsync({ projectId, title: newTitle.trim(), description: newDesc.trim(), percentageOfTotal: pct });
      setNewTitle(''); setNewDesc(''); setNewPct(''); setShowAddForm(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e?.message ?? 'Failed to create milestone');
    }
  };

  const handleLock = async () => {
    try {
      await lockMutation.mutateAsync(projectId);
      setShowLockDialog(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setShowLockDialog(false);
      alert(e?.message ?? 'Failed to lock milestones');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="ivory-card rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-foreground">Total: {totalPct}%</span>
            <span className={cn('font-medium', totalPct === 100 ? 'text-emerald-500' : 'text-muted-foreground')}>
              {totalPct === 100 ? '✓ Complete' : `${remaining}% remaining`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(totalPct, 100)}%`,
                background: totalPct === 100 ? 'hsl(142 71% 45%)' : 'var(--gold-gradient)',
              }}
            />
          </div>
          {totalPct > 100 && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> Total exceeds 100%
            </p>
          )}
        </div>

        {/* Milestone cards */}
        {(milestones ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-serif text-lg font-semibold text-foreground">No milestones yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {viewerRole === 'VENDOR'
                ? 'Add milestones to define the project execution plan.'
                : 'Waiting for vendor to define milestones.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(milestones ?? []).map((ms, i) => (
              <MilestoneCard
                key={ms.id}
                milestone={ms}
                projectId={projectId}
                viewerRole={viewerRole}
                order={i + 1}
              />
            ))}
          </div>
        )}

        {/* Add milestone form */}
        {viewerRole === 'VENDOR' && !allLocked && (
          <>
            {showAddForm ? (
              <div className="neu-card-3d rounded-2xl p-5 space-y-4">
                <h3 className="font-serif font-semibold text-foreground">Add Milestone</h3>
                {formError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formError}
                  </p>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Title *</label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Demolition & Civil Work" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    placeholder="Describe what this milestone covers…"
                    className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Percentage * <span className="text-muted-foreground font-normal">({remaining}% remaining)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={remaining}
                      value={newPct}
                      onChange={(e) => setNewPct(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdd}
                    disabled={createMutation.isPending}
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Add Milestone
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddForm(false); setFormError(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="w-full gap-2 border-dashed"
                disabled={remaining === 0}
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </Button>
            )}

            {/* Lock all milestones */}
            {canLock && (
              <Button
                onClick={() => setShowLockDialog(true)}
                className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Lock className="h-4 w-4" />
                Lock All Milestones
              </Button>
            )}
          </>
        )}
      </div>

      {/* Lock confirmation dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Lock All Milestones?</DialogTitle>
            <DialogDescription>
              Once locked, milestones cannot be edited. The customer will be notified to fund escrow for each milestone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {(milestones ?? []).map((ms, i) => (
              <div key={ms.id} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
                <span className="text-foreground">{i + 1}. {ms.title}</span>
                <span className="font-medium text-accent">{ms.percentageOfTotal}%</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm font-semibold pt-1">
              <span>Total</span>
              <span className={totalPct === 100 ? 'text-emerald-500' : 'text-destructive'}>{totalPct}%</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockDialog(false)} disabled={lockMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleLock}
              disabled={lockMutation.isPending}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {lockMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <Lock className="h-4 w-4" />
              Lock Milestones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
