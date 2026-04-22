'use client';

/**
 * BiddingRoomTable — anonymous bids, sortable columns, shortlist, expiry countdown.
 * CUST-30: Bidding Room dashboard shows all bids in a clean table
 * CUST-31: Bids shown with anonymous labels — NO vendor identity
 * CUST-32: Table columns: Anonymous Label, Quote, Timeline, Material Level, Status
 * CUST-33: Sort bids by quote, timeline, or material level
 * CUST-38: Shortlist button on each bid row
 * CUST-40: Bidding room expiry countdown
 * CUST-41: Total bid count displayed prominently
 * CUST-15: Enforce anonymity — vendorId never appears in UI
 */

import { useState, useEffect, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Star, StarOff, Users, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VendorProfileCard } from '@/components/bidding/VendorProfileCard';
import { TrustSignals } from '@/components/bidding/TrustSignals';
import { useBiddingRoom, useShortlistBid, useSelectVendor } from '@/lib/api/bidding';
import { formatInr } from '@/lib/utils/money';
import type { Bid } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Countdown hook
// ---------------------------------------------------------------------------

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setTimeLeft(d > 0 ? `${d}d ${h}h remaining` : `${h}h ${m}m remaining`);
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return timeLeft;
}

// ---------------------------------------------------------------------------
// Sort types
// ---------------------------------------------------------------------------

type SortKey = 'quote' | 'timeline' | 'material';
type SortDir = 'asc' | 'desc';

const MATERIAL_ORDER: Record<string, number> = { ECONOMY: 1, STANDARD: 2, PREMIUM: 3, LUXURY: 4 };
const MATERIAL_LABELS: Record<string, string> = { ECONOMY: 'Economy', STANDARD: 'Standard', PREMIUM: 'Premium', LUXURY: 'Luxury' };
const MATERIAL_COLORS: Record<string, string> = {
  ECONOMY: 'hsl(0 0% 50%)',
  STANDARD: 'hsl(217 65% 60%)',
  PREMIUM: 'hsl(40 45% 55%)',
  LUXURY: 'hsl(280 60% 65%)',
};

// ---------------------------------------------------------------------------
// BidRow
// ---------------------------------------------------------------------------

interface BidRowProps {
  bid: Bid;
  onViewProfile: (bid: Bid) => void;
  onShortlist: (bid: Bid) => void;
  isShortlisting: boolean;
}

function BidRow({ bid, onViewProfile, onShortlist, isShortlisting }: BidRowProps) {
  return (
    <tr
      className="border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer"
      onClick={() => onViewProfile(bid)}
    >
      {/* Anonymous label */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent font-serif">
            {bid.anonymousLabel.charAt(bid.anonymousLabel.length - 1)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{bid.anonymousLabel}</p>
            {bid.isShortlisted && (
              <span className="text-[10px] font-medium text-accent">★ Shortlisted</span>
            )}
          </div>
        </div>
      </td>

      {/* Quote */}
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {formatInr(bid.quotePaise)}
        </p>
      </td>

      {/* Timeline */}
      <td className="px-4 py-3">
        <p className="text-sm text-foreground">{bid.timelineWeeks} weeks</p>
      </td>

      {/* Material */}
      <td className="px-4 py-3">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            background: `${MATERIAL_COLORS[bid.materialLevel]}15`,
            color: MATERIAL_COLORS[bid.materialLevel],
          }}
        >
          {MATERIAL_LABELS[bid.materialLevel]}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShortlist(bid)}
            disabled={isShortlisting}
            aria-label={bid.isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
            className={cn(
              'h-8 w-8',
              bid.isShortlisted ? 'text-accent hover:text-accent/80' : 'text-muted-foreground hover:text-accent',
            )}
          >
            {isShortlisting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : bid.isShortlisted ? (
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
            ) : (
              <StarOff className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(bid)}
            className="h-8 text-xs"
          >
            View Profile
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// BiddingRoomTable
// ---------------------------------------------------------------------------

interface BiddingRoomTableProps {
  projectId: string;
}

export function BiddingRoomTable({ projectId }: BiddingRoomTableProps) {
  const { data: room, isLoading, error } = useBiddingRoom(projectId);
  const shortlistMutation = useShortlistBid();
  const selectMutation = useSelectVendor();

  const [sortKey, setSortKey] = useState<SortKey>('quote');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [shortlistingId, setShortlistingId] = useState<string | null>(null);

  const countdown = useCountdown(room?.expiresAt ?? new Date(Date.now() + 30 * 86_400_000).toISOString());

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const sortedBids = [...(room?.bids ?? [])].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'quote') cmp = a.quotePaise - b.quotePaise;
    else if (sortKey === 'timeline') cmp = a.timelineWeeks - b.timelineWeeks;
    else if (sortKey === 'material') cmp = (MATERIAL_ORDER[a.materialLevel] ?? 0) - (MATERIAL_ORDER[b.materialLevel] ?? 0);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleShortlist = async (bid: Bid) => {
    setShortlistingId(bid.id);
    try {
      await shortlistMutation.mutateAsync({ bidId: bid.id, projectId });
    } finally {
      setShortlistingId(null);
    }
  };

  const handleSelectVendor = async (bid: Bid) => {
    await selectMutation.mutateAsync({ projectId, bidId: bid.id });
    setSelectedBid(null);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      : <ArrowDown className="h-3.5 w-3.5 text-accent" aria-hidden="true" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load bids. Please refresh.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header stats */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">
                {room?.totalBids ?? 0} bids received
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span className={room?.isExpired ? 'text-destructive font-medium' : ''}>{countdown}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Sorted by{' '}
            <span className="font-medium text-foreground capitalize">{sortKey}</span>
          </div>
        </div>

        {sortedBids.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
            <p className="font-serif text-lg font-semibold text-foreground">No bids yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vendors will start bidding once your project is published.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[600px]" aria-label="Vendor bids">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => handleSort('quote')}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Quote <SortIcon col="quote" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => handleSort('timeline')}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Timeline <SortIcon col="timeline" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => handleSort('material')}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Material <SortIcon col="material" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid) => (
                  <BidRow
                    key={bid.id}
                    bid={bid}
                    onViewProfile={setSelectedBid}
                    onShortlist={handleShortlist}
                    isShortlisting={shortlistingId === bid.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Trust signals — always visible */}
        <TrustSignals />
      </div>

      {/* Vendor profile modal */}
      {selectedBid && (
        <VendorProfileCard
          bid={selectedBid}
          open={!!selectedBid}
          onClose={() => setSelectedBid(null)}
          onSelect={handleSelectVendor}
          isSelecting={selectMutation.isPending}
        />
      )}
    </>
  );
}
