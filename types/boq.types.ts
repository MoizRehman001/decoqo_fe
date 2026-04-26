/**
 * BOQ (Bill of Quantities) domain types.
 * Sprint 6 — BOQ Editor + Payments
 */

// ---------------------------------------------------------------------------
// BOQ
// ---------------------------------------------------------------------------

export type BoqStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'LOCKED' | 'CHANGES_REQUESTED';

export type BoqItemUnit =
  | 'sqft'
  | 'sqm'
  | 'rft'
  | 'nos'
  | 'kg'
  | 'ltr'
  | 'set'
  | 'lot';

export interface BoqItem {
  id: string;
  boqId: string;
  room: string;
  category: string;
  description: string;
  material: string;
  brand: string;
  quantity: number;
  unit: BoqItemUnit;
  /** Rate per unit in paise */
  ratePaise: number;
  /** Auto-calculated: quantity × ratePaise */
  amountPaise: number;
  milestoneId?: string;
  notes?: string;
  order: number;
}

export interface BoqVersion {
  id: string;
  boqId: string;
  versionNumber: number;
  snapshotAt: string;
  totalAmountPaise: number;
  reason: string;
}

export type VariationType = 'POSITIVE' | 'NEGATIVE';
export type VariationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VariationItem {
  itemId: string;
  description: string;
  oldRatePaise: number;
  newRatePaise: number;
  oldQuantity: number;
  newQuantity: number;
}

export interface Variation {
  id: string;
  boqId: string;
  type: VariationType;
  reason: string;
  affectedItems: VariationItem[];
  deltaAmountPaise: number;
  status: VariationStatus;
  newBoqVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Boq {
  id: string;
  projectId: string;
  vendorId: string;
  status: BoqStatus;
  items: BoqItem[];
  versions: BoqVersion[];
  variations: Variation[];
  /** Grand total in paise — auto-calculated */
  grandTotalPaise: number;
  submittedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Payment / Escrow
// ---------------------------------------------------------------------------

export type PaymentStatus = 'PENDING' | 'INITIATED' | 'FUNDED' | 'FAILED' | 'REFUNDED';

export interface EscrowAccount {
  id: string;
  milestoneId: string;
  projectId: string;
  amountPaise: number;
  status: import('@/types/negotiation.types').EscrowStatus;
  razorpayOrderId?: string;
  fundedAt?: string;
  releasedAt?: string;
  createdAt: string;
}

export interface PaymentHistoryItem {
  id: string;
  projectId: string;
  milestoneId: string;
  milestoneTitle: string;
  amountPaise: number;
  type: 'ESCROW_FUNDED' | 'ESCROW_RELEASED' | 'ESCROW_REFUNDED';
  status: PaymentStatus;
  razorpayPaymentId?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// BOQ API Payloads
// ---------------------------------------------------------------------------

export interface AddBoqItemPayload {
  boqId: string;
  room: string;
  category: string;
  description: string;
  material: string;
  brand: string;
  quantity: number;
  unit: BoqItemUnit;
  ratePaise: number;
  milestoneId?: string;
  notes?: string;
}

export interface UpdateBoqItemPayload {
  itemId: string;
  boqId: string;
  quantity?: number;
  ratePaise?: number;
  description?: string;
  material?: string;
  brand?: string;
}
