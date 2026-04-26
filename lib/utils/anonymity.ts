/**
 * Anonymity enforcement utilities.
 * 4.15: Enforce anonymity — verify vendorId never appears in bidding room UI
 *
 * These utilities create "safe" bid views that strip all vendor identity fields.
 * Components in the bidding room MUST use SafeBid, never raw Bid.
 */

import type { Bid } from '@/types/bidding.types';

/**
 * A bid view safe for display during the BIDDING_OPEN phase.
 * vendorId is intentionally omitted — it must never appear in the UI.
 */
export interface SafeBid {
  id: string;
  projectId: string;
  /** Anonymous label — the ONLY vendor identifier shown during bidding */
  anonymousLabel: string;
  quotePaise: number;
  timelineWeeks: number;
  materialLevel: Bid['materialLevel'];
  scopeAssumptions: string;
  notes: string;
  status: Bid['status'];
  isShortlisted: boolean;
  submittedAt: string;
  updatedAt: string;
  // vendorId is DELIBERATELY ABSENT
}

/**
 * Strips vendorId from a bid, returning a SafeBid for UI rendering.
 * This is the single enforcement point — all bidding room components
 * should accept SafeBid, not Bid.
 */
export function toSafeBid(bid: Bid): SafeBid {
  // Destructure to explicitly exclude vendorId
  const { vendorId: _stripped, ...safeBid } = bid;
  void _stripped; // intentionally unused — we're stripping it
  return safeBid;
}

/**
 * Converts an array of bids to safe bids.
 */
export function toSafeBids(bids: Bid[]): SafeBid[] {
  return bids.map(toSafeBid);
}

/**
 * Runtime assertion — throws in development if a vendorId is found
 * in any rendered bid data. Use in tests and dev guards.
 */
export function assertNoVendorIdInBids(bids: SafeBid[]): void {
  if (process.env.NODE_ENV !== 'development') return;
  for (const bid of bids) {
    if ('vendorId' in bid) {
      throw new Error(
        `[Anonymity Violation] vendorId found in bid ${bid.id} (${bid.anonymousLabel}). ` +
        'Use toSafeBid() before passing bids to bidding room components.',
      );
    }
  }
}
