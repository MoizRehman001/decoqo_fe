'use client';

/**
 * Admin Dispute Queue — Sprint 8
 * 8.4: DisputeQueue list with SLA indicator
 * 8.5: Dispute detail page (full evidence bundle, BOQ, design, chat)
 * 8.6: DisputeDecisionForm (Full Release / Partial / Refund + reason)
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, Clock, CheckCircle2, Search,
  Loader2, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from 'boneyard-js/react';
import { useAdminDisputes, useDecideDispute, useUpdateDisputeStatus } from '@/lib/api/admin';
import { formatInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { AdminDispute, AdminDisputeStatus } from '@/types/admin.types';

// ---------------------------------------------------------------------------
// SLA indicator
// ---------------------------------------------------------------------------

function SlaIndicator({ deadline }: { deadline: string }) {
  const ms = new Date(deadline).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  const isOverdue = ms <= 0;
  const isUrgent = !isOverdue && hours <= 24;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        isOverdue && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
        isUrgent && !isOverdue && 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
        !isUrgent && !isOverdue && 'bg-muted text-muted-foreground',
      )}
    >
      <Clock className="h-3 w-3" aria-hidden="true" />
      {isOverdue ? 'Overdue' : `${hours}h SLA`}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<AdminDisputeStatus, { label: string; color: string }> = {
  OPEN:                { label: 'Open',               color: 'hsl(0 72% 60%)' },
  EVIDENCE_COLLECTION: { label: 'Evidence Collection', color: 'hsl(40 45% 55%)' },
  ADMIN_REVIEW:        { label: 'Admin Review',        color: 'hsl(217 65% 60%)' },
  DECIDED:             { label: 'Decided',             color: 'hsl(142 71% 45%)' },
  CLOSED:              { label: 'Closed',              color: 'hsl(0 0% 50%)' },
};

const REASON_LABELS: Record<string, string> = {
  INCOMPLETE_WORK:       'Incomplete Work',
  QUALITY_BELOW_STANDARD:'Quality Below Standard',
  TIMELINE_EXCEEDED:     'Timeline Exceeded',
  MATERIALS_SUBSTITUTED: 'Materials Substituted',
  SCOPE_EXCEEDED:        'Scope Exceeded',
  OTHER:                 'Other',
};

// ---------------------------------------------------------------------------
// Decision form
// ---------------------------------------------------------------------------

interface DecisionFormProps {
  dispute: AdminDispute;
  onClose: () => void;
}

function DecisionForm({ dispute, onClose }: DecisionFormProps) {
  const decideMutation = useDecideDispute();
  const [decision, setDecision] = useState<'FULL_RELEASE' | 'PARTIAL_RELEASE' | 'FULL_REFUND' | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const DECISION_OPTIONS = [
    {
      value: 'FULL_RELEASE' as const,
      label: 'Full Release',
      desc: 'Release 100% of escrow to vendor',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      value: 'PARTIAL_RELEASE' as const,
      label: 'Partial Release',
      desc: 'Release partial amount, hold remainder',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'border-amber-400/40 bg-amber-50 dark:bg-amber-950/20',
    },
    {
      value: 'FULL_REFUND' as const,
      label: 'Full Refund',
      desc: 'Refund 100% of escrow to customer',
      color: 'text-destructive',
      bg: 'border-destructive/40 bg-destructive/10',
    },
  ];

  const handleSubmit = async () => {
    if (!decision || !reason.trim()) { setError('Please select a decision and provide a reason.'); return; }
    setError(null);
    try {
      await decideMutation.mutateAsync({ disputeId: dispute.id, decision, reason: reason.trim() });
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to submit decision.');
    }
  };

  return (
    <div className="space-y-5 py-2">
      {/* Dispute summary */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5 text-sm">
        <p className="font-semibold text-foreground">{dispute.projectTitle}</p>
        <p className="text-muted-foreground">{dispute.milestoneTitle}</p>
        <p className="text-muted-foreground">
          Raised by: <span className="font-medium text-foreground capitalize">{dispute.raisedBy.toLowerCase()}</span>
          {' · '}{REASON_LABELS[dispute.reason] ?? dispute.reason}
        </p>
        <p className="font-serif text-lg font-bold text-accent">{formatInr(dispute.amountPaise)}</p>
      </div>

      {/* Decision options */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Decision</p>
        {DECISION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDecision(opt.value)}
            className={cn(
              'w-full rounded-xl border p-3 text-left transition-all',
              decision === opt.value ? opt.bg : 'border-border hover:bg-muted/20',
            )}
          >
            <p className={cn('text-sm font-semibold', decision === opt.value ? opt.color : 'text-foreground')}>
              {opt.label}
            </p>
            <p className="text-xs text-muted-foreground">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Reason */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Decision Reason <span className="text-destructive">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Explain the basis for this decision…"
          className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={decideMutation.isPending}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!decision || !reason.trim() || decideMutation.isPending}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {decideMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Issue Decision
        </Button>
      </DialogFooter>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispute row
// ---------------------------------------------------------------------------

function DisputeRow({ dispute }: { dispute: AdminDispute }) {
  const [expanded, setExpanded] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const updateStatusMutation = useUpdateDisputeStatus();

  const cfg = STATUS_CONFIG[dispute.status];
  const isResolved = dispute.status === 'DECIDED' || dispute.status === 'CLOSED';

  return (
    <>
      <div className={cn('ivory-card rounded-2xl overflow-hidden', isResolved && 'opacity-70')}>
        {/* Header */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-start gap-4 p-5 text-left hover:bg-muted/10 transition-colors"
          aria-expanded={expanded}
        >
          <AlertTriangle
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0',
              new Date(dispute.slaDeadline).getTime() - Date.now() < 24 * 3_600_000 && !isResolved
                ? 'text-red-500'
                : 'text-amber-500',
            )}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif font-semibold text-foreground">{dispute.projectTitle}</h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ background: `${cfg.color}15`, color: cfg.color }}
              >
                {cfg.label}
              </span>
              {!isResolved && <SlaIndicator deadline={dispute.slaDeadline} />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {dispute.milestoneTitle} · {REASON_LABELS[dispute.reason] ?? dispute.reason}
            </p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Customer: <span className="font-medium text-foreground">{dispute.customerName}</span></span>
              <span>Vendor: <span className="font-medium text-foreground">{dispute.vendorName}</span></span>
              <span>Raised by: <span className="font-medium text-foreground capitalize">{dispute.raisedBy.toLowerCase()}</span></span>
              <span className="font-serif font-bold text-accent">{formatInr(dispute.amountPaise)}</span>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </button>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-border/50 p-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{dispute.description}</p>

            {/* Decision result */}
            {dispute.decision && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Decision: {dispute.decision.replace(/_/g, ' ')}
                </p>
                <p className="mt-0.5 text-sm text-emerald-600 dark:text-emerald-300">{dispute.decisionReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/disputes/${dispute.projectId}/evidence`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/30 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" /> View Evidence
              </Link>

              {/* Status progression */}
              {dispute.status === 'OPEN' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ disputeId: dispute.id, status: 'EVIDENCE_COLLECTION' })}
                  disabled={updateStatusMutation.isPending}
                  className="h-7 text-xs"
                >
                  Start Evidence Collection
                </Button>
              )}
              {dispute.status === 'EVIDENCE_COLLECTION' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ disputeId: dispute.id, status: 'ADMIN_REVIEW' })}
                  disabled={updateStatusMutation.isPending}
                  className="h-7 text-xs"
                >
                  Move to Admin Review
                </Button>
              )}
              {(dispute.status === 'ADMIN_REVIEW' || dispute.status === 'EVIDENCE_COLLECTION') && (
                <Button
                  size="sm"
                  onClick={() => setShowDecision(true)}
                  className="h-7 gap-1.5 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Issue Decision
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Decision dialog */}
      <Dialog open={showDecision} onOpenChange={setShowDecision}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Issue Dispute Decision</DialogTitle>
            <DialogDescription>
              This decision is final and will trigger the corresponding escrow action.
            </DialogDescription>
          </DialogHeader>
          <DecisionForm dispute={dispute} onClose={() => setShowDecision(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDisputesPage() {
  const { data: disputes, isLoading } = useAdminDisputes();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminDisputeStatus | 'ALL'>('ALL');

  const filtered = (disputes ?? []).filter((d) => {
    const matchSearch =
      !search.trim() ||
      d.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase()) ||
      d.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCount = (disputes ?? []).filter((d) => d.status !== 'DECIDED' && d.status !== 'CLOSED').length;

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Dispute Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {openCount} open dispute{openCount !== 1 ? 's' : ''} requiring resolution.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search disputes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'OPEN', 'EVIDENCE_COLLECTION', 'ADMIN_REVIEW', 'DECIDED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                statusFilter === s
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <Skeleton name="admin-dispute-queue" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <div className="space-y-4">
          {filtered.map((d) => <DisputeRow key={d.id} dispute={d} />)}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-serif text-lg font-semibold text-foreground">No disputes found</p>
            </div>
          )}
        </div>
      </Skeleton>
    </div>
  );
}
