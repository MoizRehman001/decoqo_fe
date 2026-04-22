'use client';

/**
 * My Bids page — vendor side.
 * VEND-24: My Bids list with project title, status, submitted date
 * VEND-23: Withdraw bid before selection
 */

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ExternalLink } from 'lucide-react';
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
import { useMyBids, useWithdrawBid } from '@/lib/api/bidding';
import { formatInr } from '@/lib/utils/money';
import type { Bid } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'hsl(217 65% 60%)', bg: 'hsl(217 65% 60% / 0.1)' },
  SHORTLISTED: { label: 'Shortlisted ★', color: 'hsl(40 45% 55%)', bg: 'hsl(40 45% 55% / 0.1)' },
  SELECTED: { label: 'Selected ✓', color: 'hsl(142 71% 45%)', bg: 'hsl(142 71% 45% / 0.1)' },
  REJECTED: { label: 'Not Selected', color: 'hsl(0 0% 50%)', bg: 'hsl(0 0% 50% / 0.1)' },
  WITHDRAWN: { label: 'Withdrawn', color: 'hsl(0 0% 50%)', bg: 'hsl(0 0% 50% / 0.1)' },
};

function BidCard({ bid, onWithdraw }: { bid: Bid; onWithdraw: (bid: Bid) => void }) {
  const config = STATUS_CONFIG[bid.status] ?? STATUS_CONFIG['PENDING']!;
  const canWithdraw = bid.status === 'PENDING' || bid.status === 'SHORTLISTED';

  return (
    <div className="ivory-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-semibold text-foreground">
              Project #{bid.projectId.slice(-6)}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: config.bg, color: config.color }}
            >
              {config.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Submitted {new Date(bid.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <Link
          href={`/vendor/projects/${bid.projectId}`}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors flex-shrink-0"
        >
          View <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Quote</p>
          <p className="font-semibold text-foreground tabular-nums">{formatInr(bid.quotePaise)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Timeline</p>
          <p className="font-semibold text-foreground">{bid.timelineWeeks}w</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Material</p>
          <p className="font-semibold text-foreground capitalize">{bid.materialLevel.toLowerCase()}</p>
        </div>
      </div>

      {canWithdraw && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWithdraw(bid)}
          className="text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
        >
          Withdraw Bid
        </Button>
      )}
    </div>
  );
}

export default function MyBidsPage() {
  const VENDOR_ID = 'usr_vend_001'; // mock: current vendor
  const { data: bids, isLoading } = useMyBids(VENDOR_ID);
  const withdrawMutation = useWithdrawBid();
  const [bidToWithdraw, setBidToWithdraw] = useState<Bid | null>(null);

  const handleWithdraw = async () => {
    if (!bidToWithdraw) return;
    await withdrawMutation.mutateAsync({ bidId: bidToWithdraw.id, vendorId: VENDOR_ID });
    setBidToWithdraw(null);
  };

  return (
    <>
      <div className="space-y-6 animate-page-in">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">My Bids</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all your submitted bids and their status.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-5 space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-8 rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
        ) : !bids?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-serif text-lg font-semibold text-foreground">No bids yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse projects and submit your first bid.</p>
            <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/vendor/projects">Browse Projects</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bids.map((bid) => (
              <BidCard key={bid.id} bid={bid} onWithdraw={setBidToWithdraw} />
            ))}
          </div>
        )}
      </div>

      {/* Withdraw confirmation */}
      <Dialog open={!!bidToWithdraw} onOpenChange={(o) => !o && setBidToWithdraw(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Withdraw Bid?</DialogTitle>
            <DialogDescription>
              This will remove your bid from the project. You can submit a new bid if the project is still open.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidToWithdraw(null)} disabled={withdrawMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              className={cn('gap-2', withdrawMutation.isPending ? 'opacity-70' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            >
              {withdrawMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
