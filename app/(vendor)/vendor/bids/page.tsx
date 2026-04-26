'use client';

/**
 * My Bids — vendor side.
 *
 * Design decisions:
 * - Tabs: Active (PENDING + SHORTLISTED) | Closed (SELECTED + REJECTED + WITHDRAWN)
 * - Each status has a distinct visual treatment — not just a badge colour change
 * - SELECTED card gets a celebration treatment with next-steps CTA
 * - SHORTLISTED card gets a warm highlight with "stay ready" messaging
 * - REJECTED / WITHDRAWN cards are visually muted with empathetic copy
 * - Expandable BOQ summary per bid
 * - Withdraw confirmation dialog
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Loader2, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, Star, Clock, XCircle, Minus,
  IndianRupee, Package, ArrowRight, Trophy,
  AlertCircle, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from 'boneyard-js/react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useMyBids, useWithdrawBid } from '@/lib/api/bidding';
import { formatInr } from '@/lib/utils/money';
import type { Bid, BidStatus } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Status config — visual identity per status
// ---------------------------------------------------------------------------

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  cardClass: string;
  badgeClass: string;
  headerClass: string;
  message: string;
  subMessage: string;
}

const STATUS_CONFIG: Record<BidStatus, StatusConfig> = {
  PENDING: {
    label: 'Under Review',
    icon: Clock,
    cardClass: 'border-border bg-card',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
    headerClass: 'text-foreground',
    message: 'Your bid is being reviewed',
    subMessage: 'The customer is comparing bids. Stay patient — you\'ll be notified of any update.',
  },
  SHORTLISTED: {
    label: 'Shortlisted ★',
    icon: Star,
    cardClass: 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/10',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    headerClass: 'text-amber-800 dark:text-amber-200',
    message: 'You\'ve been shortlisted!',
    subMessage: 'The customer liked your bid. Make sure your profile and portfolio are up to date — final selection is coming.',
  },
  SELECTED: {
    label: 'Selected ✓',
    icon: Trophy,
    cardClass: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/10',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    headerClass: 'text-green-800 dark:text-green-200',
    message: 'Congratulations — you\'ve been selected!',
    subMessage: 'The customer has chosen you. A negotiation thread is now open. Check the project to get started.',
  },
  REJECTED: {
    label: 'Not Selected',
    icon: XCircle,
    cardClass: 'border-border bg-muted/20 opacity-75',
    badgeClass: 'bg-muted text-muted-foreground',
    headerClass: 'text-muted-foreground',
    message: 'This project went to another vendor',
    subMessage: 'Don\'t be discouraged — every bid is a learning opportunity. Browse more projects and keep bidding.',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    icon: Minus,
    cardClass: 'border-border bg-muted/20 opacity-60',
    badgeClass: 'bg-muted text-muted-foreground',
    headerClass: 'text-muted-foreground',
    message: 'You withdrew this bid',
    subMessage: 'If the project is still open, you can submit a new bid.',
  },
};

// ---------------------------------------------------------------------------
// BOQ Summary (collapsible)
// ---------------------------------------------------------------------------

function BoqSummary({ bid }: { bid: Bid }) {
  const [open, setOpen] = useState(false);
  const items = bid.boqItems ?? [];
  if (items.length === 0) return null;

  // Group by room for compact display
  const byRoom = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.room] = (acc[item.room] ?? 0) + item.amountInr;
    return acc;
  }, {});

  return (
    <div className="mt-3 rounded-xl border border-border/60 bg-background/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          BOQ — {items.length} line item{items.length !== 1 ? 's' : ''}
        </div>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border/60 px-3 pb-3 pt-2 space-y-1">
          {Object.entries(byRoom).map(([room, total]) => (
            <div key={room} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{room}</span>
              <span className="font-medium text-foreground tabular-nums">{formatInr(total)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-xs font-semibold">
            <span className="text-foreground">Grand Total</span>
            <span className="text-accent tabular-nums">
              {formatInr(items.reduce((s, i) => s + i.amountInr, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bid Card
// ---------------------------------------------------------------------------

function BidCard({ bid, onWithdraw }: { bid: Bid; onWithdraw: (bid: Bid) => void }) {
  const config = STATUS_CONFIG[bid.status];
  const StatusIcon = config.icon;
  const canWithdraw = bid.status === 'PENDING' || bid.status === 'SHORTLISTED';
  const isActive = bid.status === 'PENDING' || bid.status === 'SHORTLISTED';
  const isSelected = bid.status === 'SELECTED';

  // Compute total from BOQ items if available, fallback to quotePaise
  const totalInr = bid.boqItems?.length
    ? bid.boqItems.reduce((s, i) => s + i.amountInr, 0)
    : (bid.totalQuoteInr ?? (bid.quotePaise ? bid.quotePaise / 100 : 0));

  return (
    <div className={cn('rounded-2xl border p-5 transition-all duration-200', config.cardClass)}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('font-serif font-semibold', config.headerClass)}>
              {(bid as Bid & { project?: { title?: string } }).project?.title
                ?? `Project #${bid.projectId.slice(-6).toUpperCase()}`}
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', config.badgeClass)}>
              <StatusIcon className="h-3 w-3" aria-hidden="true" />
              {config.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Submitted {new Date(bid.submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
        <Link
          href={`/vendor/projects/${bid.projectId}`}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
          aria-label="View project"
        >
          View <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Status message */}
      <div className={cn(
        'mb-4 rounded-xl px-4 py-3',
        isSelected
          ? 'bg-green-100/60 dark:bg-green-950/20'
          : bid.status === 'SHORTLISTED'
          ? 'bg-amber-100/60 dark:bg-amber-950/20'
          : 'bg-muted/40',
      )}>
        <p className={cn('text-sm font-medium', config.headerClass)}>{config.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{config.subMessage}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
            <IndianRupee className="h-3 w-3" aria-hidden="true" /> Quote
          </div>
          <p className="font-semibold text-foreground tabular-nums text-xs">
            {totalInr > 0 ? formatInr(totalInr) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
            <Clock className="h-3 w-3" aria-hidden="true" /> Timeline
          </div>
          <p className="font-semibold text-foreground text-xs">{bid.timelineWeeks}w</p>
        </div>
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
            <Package className="h-3 w-3" aria-hidden="true" /> Material
          </div>
          <p className="font-semibold text-foreground capitalize text-xs">
            {(bid.materialQualityLevel ?? bid.materialLevel ?? '').toLowerCase()}
          </p>
        </div>
      </div>

      {/* BOQ summary */}
      <BoqSummary bid={bid} />

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {isSelected && (
          <Button asChild size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href={`/vendor/projects/${bid.projectId}`}>
              Open Project <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        )}
        {canWithdraw && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWithdraw(bid)}
            className="text-xs text-muted-foreground hover:border-destructive/40 hover:text-destructive"
          >
            Withdraw Bid
          </Button>
        )}
        {bid.status === 'REJECTED' && (
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href="/vendor/projects">
              Browse More <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton fixture
// ---------------------------------------------------------------------------

function BidsFixture() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border p-5 space-y-3 animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
            <div className="h-7 w-16 rounded-lg bg-muted" />
          </div>
          <div className="h-14 rounded-xl bg-muted" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-12 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------

function Tab({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        active
          ? 'text-[hsl(0_0%_4%)]'
          : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/40',
      )}
      style={active ? { background: 'var(--gold-gradient)' } : undefined}
    >
      {label}
      <span className={cn(
        'rounded-full px-1.5 py-0.5 text-xs font-semibold',
        active ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground',
      )}>
        {count}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type TabKey = 'active' | 'closed';

export default function MyBidsPage() {
  const { data: bidsResult, isLoading } = useMyBids();
  const rawBids = bidsResult?.data ?? (Array.isArray(bidsResult) ? bidsResult as Bid[] : []);
  const withdrawMutation = useWithdrawBid();
  const [bidToWithdraw, setBidToWithdraw] = useState<Bid | null>(null);
  const [tab, setTab] = useState<TabKey>('active');

  const activeBids = useMemo(
    () => rawBids.filter((b) => b.status === 'PENDING' || b.status === 'SHORTLISTED'),
    [rawBids],
  );
  const closedBids = useMemo(
    () => rawBids.filter((b) => b.status === 'SELECTED' || b.status === 'REJECTED' || b.status === 'WITHDRAWN'),
    [rawBids],
  );

  const displayedBids = tab === 'active' ? activeBids : closedBids;

  const handleWithdraw = async () => {
    if (!bidToWithdraw) return;
    await withdrawMutation.mutateAsync(bidToWithdraw.id);
    setBidToWithdraw(null);
  };

  return (
    <>
      <div className="space-y-6 animate-page-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">My Bids</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track every bid you've submitted — from review to selection.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/vendor/projects">
              Browse Projects <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        {!isLoading && rawBids.length > 0 && (
          <div className="flex gap-2">
            <Tab label="Active" count={activeBids.length} active={tab === 'active'} onClick={() => setTab('active')} />
            <Tab label="Closed" count={closedBids.length} active={tab === 'closed'} onClick={() => setTab('closed')} />
          </div>
        )}

        <Skeleton
          name="vendor-bids-list"
          loading={isLoading}
          animate="shimmer"
          transition={300}
          fixture={<BidsFixture />}
        >
          {rawBids.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <FileText className="h-7 w-7 text-accent" aria-hidden="true" />
              </div>
              <p className="font-serif text-lg font-semibold text-foreground">No bids yet</p>
              <p className="mt-2 max-w-xs mx-auto text-sm text-muted-foreground">
                Find projects in your service areas and submit your first professional BOQ-based bid.
              </p>
              <Button asChild className="mt-5 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/vendor/projects">
                  Browse Open Projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : displayedBids.length === 0 ? (
            /* Empty tab state */
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium text-foreground">
                {tab === 'active' ? 'No active bids' : 'No closed bids yet'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === 'active'
                  ? 'All your bids have been resolved. Browse projects to submit new ones.'
                  : 'Your active bids will appear here once they\'re resolved.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {displayedBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} onWithdraw={setBidToWithdraw} />
              ))}
            </div>
          )}
        </Skeleton>
      </div>

      {/* Withdraw confirmation dialog */}
      <Dialog open={!!bidToWithdraw} onOpenChange={(o) => !o && setBidToWithdraw(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Withdraw this bid?</DialogTitle>
            <DialogDescription>
              Your bid will be removed from this project. If the project is still open for bidding,
              you can submit a new bid. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBidToWithdraw(null)}
              disabled={withdrawMutation.isPending}
            >
              Keep Bid
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              className={cn(
                'gap-2',
                withdrawMutation.isPending
                  ? 'opacity-70'
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              )}
            >
              {withdrawMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Yes, Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
