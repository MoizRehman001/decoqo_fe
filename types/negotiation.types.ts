/**
 * Negotiation, Milestone, and Escrow domain types.
 * Sprint 5 — Negotiation + Milestones
 */

// ---------------------------------------------------------------------------
// Negotiation
// ---------------------------------------------------------------------------

export type NegotiationStatus =
  | 'OPEN'
  | 'PROPOSAL_PENDING'
  | 'CONFIRMED'
  | 'CLOSED';

export type MessageSenderRole = 'CUSTOMER' | 'VENDOR';

export interface NegotiationMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  /** True if contact info was detected and masked */
  flagged: boolean;
  masked: boolean;
  createdAt: string;
}

export interface NegotiationProposal {
  id: string;
  threadId: string;
  vendorId: string;
  quotePaise: number;
  timelineWeeks: number;
  materialLevel: 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED';
  createdAt: string;
}

export interface NegotiationThread {
  id: string;
  projectId: string;
  customerId: string;
  vendorId: string;
  vendorName: string;
  vendorBusinessName: string;
  status: NegotiationStatus;
  customerConfirmed: boolean;
  vendorConfirmed: boolean;
  messages: NegotiationMessage[];
  proposals: NegotiationProposal[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Milestone
// ---------------------------------------------------------------------------

export type MilestoneStatus =
  | 'DRAFT'
  | 'LOCKED'
  | 'PENDING_FUNDING'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'DISPUTED'
  | 'RELEASED';

export type EscrowStatus =
  | 'PENDING'
  | 'FUNDED'
  | 'HELD'
  | 'RELEASED'
  | 'REFUNDED';

export interface MilestoneEvidence {
  id: string;
  milestoneId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  percentageOfTotal: number;
  amountPaise: number;
  status: MilestoneStatus;
  escrowStatus: EscrowStatus;
  order: number;
  completionNotes?: string;
  evidence: MilestoneEvidence[];
  startedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Dispute
// ---------------------------------------------------------------------------

export type DisputeReason =
  | 'INCOMPLETE_WORK'
  | 'QUALITY_BELOW_STANDARD'
  | 'TIMELINE_EXCEEDED'
  | 'MATERIALS_SUBSTITUTED'
  | 'SCOPE_EXCEEDED'
  | 'OTHER';

export type DisputeStatus =
  | 'OPEN'
  | 'EVIDENCE_COLLECTION'
  | 'ADMIN_REVIEW'
  | 'DECIDED'
  | 'CLOSED';

export interface Dispute {
  id: string;
  milestoneId: string;
  projectId: string;
  raisedBy: 'CUSTOMER' | 'VENDOR';
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  decision?: 'FULL_RELEASE' | 'PARTIAL_RELEASE' | 'FULL_REFUND';
  decisionReason?: string;
  createdAt: string;
  updatedAt: string;
}
