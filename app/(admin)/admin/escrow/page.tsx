'use client';

/**
 * Admin Escrow Monitor — Sprint 8
 * 8.2: EscrowMonitor table (all escrow accounts, status, amounts)
 * 8.3: Freeze/unfreeze escrow action with reason
 */

import { useState } from 'react';
import { Wallet, Lock, Unlock, Send, Search, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from 'boneyard-js/react';
import { useEscrowMonitor, useFreezeEscrow, useUnfreezeEscrow, useReleaseEscrow } from '@/lib/api/admin';
import { formatInr, formatInrCompact } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { EscrowMonitorEntry, EscrowMonitorStatus } from '@/types/admin.types';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<EscrowMonitorStatus, { label: string; color: string }> = {
  PENDING:  { label: 'Pending',  color: 'hsl(0 0% 50%)' },
  FUNDED:   { label: 'Funded',   color: 'hsl(217 65% 60%)' },
  HELD:     { label: 'Held',     color: 'hsl(40 45% 55%)' },
  RELEASED: { label: 'Released', color: 'hsl(142 71% 45%)' },
  REFUNDED: { label: 'Refunded', color: 'hsl(280 60% 65%)' },
  FROZEN:   { label: 'Frozen',   color: 'hsl(0 72% 60%)' },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminEscrowPage() {
  const { data: entries, isLoading } = useEscrowMonitor();
  const freezeMutation = useFreezeEscrow();
  const unfreezeMutation = useUnfreezeEscrow();
  const releaseMutation = useReleaseEscrow();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EscrowMonitorStatus | 'ALL'>('ALL');
  const [freezeTarget, setFreezeTarget] = useState<EscrowMonitorEntry | null>(null);
  const [freezeReason, setFreezeReason] = useState('');
  const [releaseTarget, setReleaseTarget] = useState<EscrowMonitorEntry | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = (entries ?? []).filter((e) => {
    const matchSearch =
      !search.trim() ||
      e.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName.toLowerCase().includes(search.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalActive = (entries ?? [])
    .filter((e) => e.status === 'FUNDED' || e.status === 'HELD')
    .reduce((s, e) => s + e.amountPaise, 0);

  const handleFreeze = async () => {
    if (!freezeTarget || !freezeReason.trim()) return;
    setActionError(null);
    try {
      await freezeMutation.mutateAsync({ escrowId: freezeTarget.id, reason: freezeReason.trim() });
      setFreezeTarget(null);
      setFreezeReason('');
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message ?? 'Failed to freeze escrow.');
    }
  };

  const handleUnfreeze = async (entry: EscrowMonitorEntry) => {
    await unfreezeMutation.mutateAsync(entry.id);
  };

  const handleRelease = async () => {
    if (!releaseTarget) return;
    setActionError(null);
    try {
      await releaseMutation.mutateAsync(releaseTarget.id);
      setReleaseTarget(null);
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message ?? 'Failed to release escrow.');
    }
  };

  return (
    <div className="space-y-6 animate-page-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Escrow Monitor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All escrow accounts across active projects.
        </p>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['FUNDED', 'HELD', 'FROZEN', 'RELEASED'] as EscrowMonitorStatus[]).map((s) => {
          const count = (entries ?? []).filter((e) => e.status === s).length;
          const total = (entries ?? []).filter((e) => e.status === s).reduce((sum, e) => sum + e.amountPaise, 0);
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                statusFilter === s ? 'border-accent bg-accent/5' : 'border-border bg-card hover:bg-muted/20',
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                {cfg.label}
              </p>
              <p className="mt-1 font-serif text-lg font-bold text-foreground tabular-nums">
                {total > 0 ? formatInrCompact(total) : count}
              </p>
              <p className="text-xs text-muted-foreground">{count} accounts</p>
            </button>
          );
        })}
      </div>

      {/* Total banner */}
      <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-5 py-3">
        <Wallet className="h-5 w-5 text-accent" />
        <div>
          <p className="text-xs text-muted-foreground">Total Active Escrow Under Management</p>
          <p className="font-serif text-xl font-bold text-accent tabular-nums">
            {formatInr(totalActive)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by project, customer, or vendor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Skeleton name="admin-escrow-monitor" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[800px]" aria-label="Escrow accounts">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Project', 'Milestone', 'Customer', 'Vendor', 'Amount', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const cfg = STATUS_CONFIG[entry.status];
                const canFreeze = entry.status === 'FUNDED' || entry.status === 'HELD';
                const canUnfreeze = entry.status === 'FROZEN';
                const canRelease = entry.status === 'FUNDED' || entry.status === 'HELD';
                return (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{entry.projectTitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground truncate max-w-[140px]">{entry.milestoneTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{entry.customerName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{entry.vendorName}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold tabular-nums text-foreground">{formatInr(entry.amountPaise)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: `${cfg.color}15`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      {entry.freezeReason && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground/60 max-w-[120px] truncate">
                          {entry.freezeReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {canFreeze && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFreezeTarget(entry)}
                            className="h-7 gap-1 text-xs text-amber-600 hover:text-amber-700 hover:border-amber-400/40"
                          >
                            <Lock className="h-3 w-3" /> Freeze
                          </Button>
                        )}
                        {canUnfreeze && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnfreeze(entry)}
                            disabled={unfreezeMutation.isPending}
                            className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:border-emerald-400/40"
                          >
                            {unfreezeMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlock className="h-3 w-3" />}
                            Unfreeze
                          </Button>
                        )}
                        {canRelease && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReleaseTarget(entry)}
                            className="h-7 gap-1 text-xs text-blue-600 hover:text-blue-700 hover:border-blue-400/40"
                          >
                            <Send className="h-3 w-3" /> Release
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No escrow accounts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Skeleton>

      {/* Freeze dialog */}
      <Dialog open={!!freezeTarget} onOpenChange={(o) => !o && setFreezeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Freeze Escrow?</DialogTitle>
            <DialogDescription>
              Funds will be held and no actions can be taken until unfrozen.
            </DialogDescription>
          </DialogHeader>
          {freezeTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">{freezeTarget.projectTitle}</p>
                <p className="text-muted-foreground">{freezeTarget.milestoneTitle} · {formatInr(freezeTarget.amountPaise)}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Reason <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this escrow is being frozen…"
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFreezeTarget(null)} disabled={freezeMutation.isPending}>Cancel</Button>
            <Button
              onClick={handleFreeze}
              disabled={!freezeReason.trim() || freezeMutation.isPending}
              className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
            >
              {freezeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <Lock className="h-4 w-4" /> Freeze Escrow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release dialog */}
      <Dialog open={!!releaseTarget} onOpenChange={(o) => !o && setReleaseTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Release Escrow?</DialogTitle>
            <DialogDescription>
              Funds will be released to the vendor. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {releaseTarget && (
            <div className="rounded-xl bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">{releaseTarget.projectTitle}</p>
              <p className="text-muted-foreground">{releaseTarget.milestoneTitle}</p>
              <p className="mt-1 font-serif text-lg font-bold text-accent">{formatInr(releaseTarget.amountPaise)}</p>
            </div>
          )}
          {actionError && <p className="text-sm text-destructive">{actionError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseTarget(null)} disabled={releaseMutation.isPending}>Cancel</Button>
            <Button
              onClick={handleRelease}
              disabled={releaseMutation.isPending}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {releaseMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" /> Release Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
