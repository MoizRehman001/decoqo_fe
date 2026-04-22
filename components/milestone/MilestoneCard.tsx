'use client';

/**
 * MilestoneCard — individual milestone with escrow badge and approval actions.
 * CUST-60: Milestone list with percentage, amount, status badges
 * CUST-61: Escrow status badge always visible
 * CUST-64: Approve milestone → triggers escrow release
 * CUST-65: Request Changes button
 * CUST-66: Raise Dispute button
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, CheckCircle, RefreshCw, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { EscrowStatusBadge } from '@/components/milestone/EscrowStatusBadge';
import { useApproveMilestone, useRequestChanges, useRaiseDispute } from '@/lib/api/negotiation';
import { formatInr } from '@/lib/utils/money';
import type { Milestone } from '@/types/negotiation.types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'hsl(0 0% 50%)' },
  LOCKED: { label: 'Locked', color: 'hsl(217 65% 60%)' },
  PENDING_FUNDING: { label: 'Awaiting Funding', color: 'hsl(40 45% 55%)' },
  FUNDED: { label: 'Funded', color: 'hsl(217 65% 60%)' },
  IN_PROGRESS: { label: 'In Progress', color: 'hsl(40 45% 55%)' },
  SUBMITTED: { label: 'Submitted for Review', color: 'hsl(280 60% 65%)' },
  APPROVED: { label: 'Approved', color: 'hsl(142 71% 45%)' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'hsl(0 72% 60%)' },
  DISPUTED: { label: 'Disputed', color: 'hsl(0 72% 60%)' },
  RELEASED: { label: 'Payment Released ✓', color: 'hsl(142 71% 45%)' },
};

const DISPUTE_REASONS = [
  { value: 'INCOMPLETE_WORK', label: 'Incomplete Work' },
  { value: 'QUALITY_BELOW_STANDARD', label: 'Quality Below Standard' },
  { value: 'TIMELINE_EXCEEDED', label: 'Timeline Exceeded' },
  { value: 'MATERIALS_SUBSTITUTED', label: 'Materials Substituted' },
  { value: 'SCOPE_EXCEEDED', label: 'Scope Exceeded' },
  { value: 'OTHER', label: 'Other' },
] as const;

interface MilestoneCardProps {
  milestone: Milestone;
  projectId: string;
  viewerRole: 'CUSTOMER' | 'VENDOR';
  order: number;
}

export function MilestoneCard({ milestone, projectId, viewerRole, order }: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState<string>('INCOMPLETE_WORK');
  const [disputeDesc, setDisputeDesc] = useState('');

  const approveMutation = useApproveMilestone();
  const requestChangesMutation = useRequestChanges();
  const disputeMutation = useRaiseDispute();

  const statusCfg = STATUS_CONFIG[milestone.status] ?? STATUS_CONFIG['DRAFT']!;
  const canApprove = viewerRole === 'CUSTOMER' && milestone.status === 'SUBMITTED';

  return (
    <>
      <div className="ivory-card rounded-2xl overflow-hidden">
        {/* Header */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/20 transition-colors"
          aria-expanded={expanded}
        >
          {/* Order number */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif font-bold text-sm"
            style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
          >
            {order}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-semibold text-foreground truncate">{milestone.title}</h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0"
                style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
              >
                {statusCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{milestone.percentageOfTotal}% of total</span>
              {milestone.amountPaise > 0 && (
                <span className="font-medium text-foreground">{formatInr(milestone.amountPaise)}</span>
              )}
            </div>
          </div>

          {/* Escrow badge — always visible */}
          <EscrowStatusBadge status={milestone.escrowStatus} compact />

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-border/50 p-5 space-y-4">
            <p className="text-sm text-muted-foreground">{milestone.description}</p>

            {/* Escrow status full */}
            <EscrowStatusBadge status={milestone.escrowStatus} />

            {/* Completion notes */}
            {milestone.completionNotes && (
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Completion Notes</p>
                <p className="text-sm text-muted-foreground">{milestone.completionNotes}</p>
              </div>
            )}

            {/* Evidence gallery */}
            {milestone.evidence.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Evidence ({milestone.evidence.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {milestone.evidence.map((ev) => (
                    <div key={ev.id} className="relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src={ev.fileUrl}
                        alt={ev.fileName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer approval actions */}
            {canApprove && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                <Button
                  size="sm"
                  onClick={() => setShowApproveDialog(true)}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve &amp; Release Payment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => requestChangesMutation.mutate({ milestoneId: milestone.id, notes: 'Changes requested', projectId })}
                  disabled={requestChangesMutation.isPending}
                  className="gap-1.5"
                >
                  {requestChangesMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Request Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDisputeDialog(true)}
                  className="gap-1.5 text-destructive hover:text-destructive hover:border-destructive/40"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Raise Dispute
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approve confirmation dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Approve &amp; Release Payment?</DialogTitle>
            <DialogDescription>
              This will release <strong>{formatInr(milestone.amountPaise)}</strong> from escrow to the vendor.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={approveMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await approveMutation.mutateAsync({ milestoneId: milestone.id, projectId });
                setShowApproveDialog(false);
              }}
              disabled={approveMutation.isPending}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {approveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Yes, Release Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Raise a Dispute</DialogTitle>
            <DialogDescription>
              Escrow will be held until the dispute is resolved by Decoqo admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Reason</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {DISPUTE_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
              <textarea
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                rows={3}
                placeholder="Describe the issue in detail…"
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)} disabled={disputeMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await disputeMutation.mutateAsync({
                  milestoneId: milestone.id,
                  reason: disputeReason as import('@/types/negotiation.types').DisputeReason,
                  description: disputeDesc,
                  projectId,
                });
                setShowDisputeDialog(false);
              }}
              disabled={disputeMutation.isPending || !disputeDesc.trim()}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disputeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Raise Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
