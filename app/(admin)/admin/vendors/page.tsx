'use client';

/**
 * Admin KYC Queue — Sprint 8
 * 8.7: KycQueue (pending vendors, approve/reject)
 * 8.10: Vendor KYC submission form (vendor side — view only for admin)
 */

import { useState } from 'react';
import Image from 'next/image';
import {
  BadgeCheck, Clock, XCircle, Search, ChevronDown, ChevronUp,
  FileText, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from 'boneyard-js/react';
import { useKycQueue, useApproveKyc, useRejectKyc } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import type { KycSubmission, KycStatus } from '@/types/admin.types';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<KycStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:  { label: 'Pending Review', color: 'hsl(40 45% 55%)',  icon: Clock },
  APPROVED: { label: 'Approved',       color: 'hsl(142 71% 45%)', icon: BadgeCheck },
  REJECTED: { label: 'Rejected',       color: 'hsl(0 72% 60%)',   icon: XCircle },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  AADHAAR:       'Aadhaar Card',
  PAN:           'PAN Card',
  GST:           'GST Certificate',
  BANK_STATEMENT:'Bank Statement',
  PORTFOLIO:     'Portfolio',
};

// ---------------------------------------------------------------------------
// KYC Card
// ---------------------------------------------------------------------------

function KycCard({ submission }: { submission: KycSubmission }) {
  const approveMutation = useApproveKyc();
  const rejectMutation = useRejectKyc();

  const [expanded, setExpanded] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cfg = STATUS_CONFIG[submission.status];
  const StatusIcon = cfg.icon;
  const isPending = submission.status === 'PENDING';

  const daysAgo = Math.floor(
    (Date.now() - new Date(submission.submittedAt).getTime()) / 86_400_000,
  );

  const handleApprove = async () => {
    setError(null);
    try {
      await approveMutation.mutateAsync(submission.id);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to approve.');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setError(null);
    try {
      await rejectMutation.mutateAsync({ kycId: submission.id, reason: rejectReason.trim() });
      setShowRejectDialog(false);
      setRejectReason('');
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to reject.');
    }
  };

  return (
    <>
      <div className={cn('ivory-card rounded-2xl overflow-hidden', !isPending && 'opacity-75')}>
        {/* Header */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-4 p-5 text-left hover:bg-muted/10 transition-colors"
          aria-expanded={expanded}
        >
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-lg font-bold text-accent">
            {submission.vendorName.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-semibold text-foreground">{submission.vendorName}</h3>
              <span
                className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ background: `${cfg.color}15`, color: cfg.color }}
              >
                <StatusIcon className="h-3 w-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{submission.businessName} · {submission.city}</p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{submission.yearsExperience} yrs experience</span>
              <span>{submission.documents.length} documents</span>
              <span>Submitted {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}</span>
            </div>
          </div>

          {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </button>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-border/50 p-5 space-y-5">
            {/* Contact */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{submission.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{submission.phone}</p>
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Specialisations
              </p>
              <div className="flex flex-wrap gap-2">
                {submission.categories.map((c) => (
                  <span key={c} className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Documents ({submission.documents.length})
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {submission.documents.map((doc) => (
                  <div key={doc.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <Image
                        src={doc.fileUrl}
                        alt={doc.fileName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-semibold text-foreground">
                        {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{doc.fileName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection reason */}
            {submission.rejectionReason && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-xs font-semibold text-destructive">Rejection Reason</p>
                <p className="mt-0.5 text-sm text-destructive/80">{submission.rejectionReason}</p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Actions */}
            {isPending && (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Approve KYC
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  className="gap-2 text-destructive hover:text-destructive hover:border-destructive/40"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Reject KYC Application?</DialogTitle>
            <DialogDescription>
              The vendor will be notified with your reason and can resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Explain why the application is being rejected…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={rejectMutation.isPending}>Cancel</Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejectMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

function KycQueueFixture() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminVendorsPage() {
  const { data: submissions, isLoading } = useKycQueue();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<KycStatus | 'ALL'>('ALL');

  const filtered = (submissions ?? []).filter((s) => {
    const matchSearch =
      !search.trim() ||
      s.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = (submissions ?? []).filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">KYC Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount} vendor application{pendingCount !== 1 ? 's' : ''} pending review.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
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
      <Skeleton name="admin-kyc-queue" loading={isLoading} animate="shimmer" transition={300} fixture={<KycQueueFixture />}>
        <div className="space-y-4">
          {filtered.map((s) => <KycCard key={s.id} submission={s} />)}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-serif text-lg font-semibold text-foreground">No applications found</p>
            </div>
          )}
        </div>
      </Skeleton>
    </div>
  );
}
