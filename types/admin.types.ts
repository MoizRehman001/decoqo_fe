/**
 * Admin domain types — Sprint 8
 */

// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT_REQUIRED';

export interface KycDocument {
  id: string;
  type: 'AADHAAR' | 'PAN' | 'GST' | 'BANK_STATEMENT' | 'PORTFOLIO';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface KycSubmission {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  city: string;
  phone: string;
  email: string;
  categories: string[];
  yearsExperience: number;
  documents: KycDocument[];
  status: KycStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  projectCount: number;
  joinedAt: string;
  lastActiveAt: string;
  suspensionReason?: string;
}

// ---------------------------------------------------------------------------
// Escrow Monitor
// ---------------------------------------------------------------------------

export type EscrowMonitorStatus = 'PENDING' | 'FUNDED' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'FROZEN';

export interface EscrowMonitorEntry {
  id: string;
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  amountPaise: number;
  status: EscrowMonitorStatus;
  razorpayOrderId?: string;
  fundedAt?: string;
  releasedAt?: string;
  frozenAt?: string;
  freezeReason?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Dispute (extended for admin)
// ---------------------------------------------------------------------------

export type AdminDisputeStatus = 'OPEN' | 'EVIDENCE_COLLECTION' | 'ADMIN_REVIEW' | 'DECIDED' | 'CLOSED';

export interface AdminDispute {
  id: string;
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  raisedBy: 'CUSTOMER' | 'VENDOR';
  reason: string;
  description: string;
  amountPaise: number;
  status: AdminDisputeStatus;
  slaDeadline: string;
  decision?: 'FULL_RELEASE' | 'PARTIAL_RELEASE' | 'FULL_REFUND';
  decisionReason?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

export type AuditAction =
  | 'VENDOR_APPROVED'
  | 'VENDOR_REJECTED'
  | 'USER_SUSPENDED'
  | 'USER_BANNED'
  | 'USER_REINSTATED'
  | 'ESCROW_FROZEN'
  | 'ESCROW_UNFROZEN'
  | 'ESCROW_RELEASED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'CONTACT_MASKED'
  | 'ADMIN_LOGIN'
  | 'BOQ_OVERRIDE'
  | 'MILESTONE_OVERRIDE';

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: 'ADMIN' | 'SYSTEM';
  action: AuditAction;
  target: string;
  targetId: string;
  metadata?: Record<string, string | number>;
  ipAddress: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Admin Dashboard Stats
// ---------------------------------------------------------------------------

export interface AdminDashboardStats {
  totalEscrowPaise: number;
  activeEscrowPaise: number;
  openDisputeCount: number;
  pendingKycCount: number;
  activeUserCount: number;
  activeProjectCount: number;
  totalProjectCount: number;
  escrowTrend: number;
  disputeTrend: number;
  kycTrend: number;
  userTrend: number;
}
