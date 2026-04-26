/**
 * Project Timeline domain types.
 * Sprint 7 — Chat + Dispute + Timeline
 */

export type TimelineEventType =
  | 'PROJECT_CREATED'
  | 'PROJECT_PUBLISHED'
  | 'BID_RECEIVED'
  | 'VENDOR_SELECTED'
  | 'NEGOTIATION_CONFIRMED'
  | 'MILESTONE_LOCKED'
  | 'ESCROW_FUNDED'
  | 'MILESTONE_SUBMITTED'
  | 'MILESTONE_APPROVED'
  | 'MILESTONE_CHANGES_REQUESTED'
  | 'DISPUTE_RAISED'
  | 'DISPUTE_RESOLVED'
  | 'BOQ_SUBMITTED'
  | 'BOQ_APPROVED'
  | 'BOQ_LOCKED'
  | 'VARIATION_RAISED'
  | 'VARIATION_APPROVED'
  | 'PROJECT_COMPLETED'
  | 'RATING_SUBMITTED';

export interface TimelineEvent {
  id: string;
  projectId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  actor: string;
  actorRole: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SYSTEM';
  metadata?: Record<string, string | number>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Rating
// ---------------------------------------------------------------------------

export interface ProjectRating {
  id: string;
  projectId: string;
  ratedBy: 'CUSTOMER' | 'VENDOR';
  raterName: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}
