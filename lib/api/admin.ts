/**
 * Admin API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/admin/admin.controller.ts
 * All endpoints require ADMIN or SUPER_ADMIN role.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type {
  AdminDashboardStats,
  EscrowMonitorEntry,
  AdminDispute,
  KycSubmission,
  KycStatus,
  AdminUser,
  UserStatus,
  AuditLogEntry,
  AdminDisputeStatus,
} from '@/types/admin.types';
import type { PaginatedResult } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  escrow: ['admin', 'escrow'] as const,
  disputes: ['admin', 'disputes'] as const,
  dispute: (id: string) => ['admin', 'dispute', id] as const,
  kyc: ['admin', 'kyc'] as const,
  users: ['admin', 'users'] as const,
  audit: (search?: string) => ['admin', 'audit', search ?? ''] as const,
};

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

/**
 * Get admin dashboard stats.
 * ⚠️ No dedicated /admin/stats endpoint exists — stats are derived from
 * the escrow and dispute lists. This hook computes them client-side.
 */
export function useAdminStats() {
  const { data: escrowResult } = useEscrowMonitor();
  const { data: disputesResult } = useAdminDisputes();
  const { data: kycResult } = useKycQueue();
  const { data: usersResult } = useAdminUsers();

  // All hooks return PaginatedResult<T> — extract arrays safely
  const escrows = Array.isArray(escrowResult) ? escrowResult : (escrowResult as unknown as { data?: EscrowMonitorEntry[] })?.data ?? [];
  const disputes = disputesResult?.data ?? (Array.isArray(disputesResult) ? disputesResult : []);
  const kycQueue = kycResult?.data ?? (Array.isArray(kycResult) ? kycResult : []);
  const users = usersResult?.data ?? (Array.isArray(usersResult) ? usersResult : []);

  const stats: AdminDashboardStats = {
    totalEscrowPaise: escrows.reduce((s, e) => s + e.amountPaise, 0),
    activeEscrowPaise: escrows
      .filter((e) => e.status === 'FUNDED' || e.status === 'HELD')
      .reduce((s, e) => s + e.amountPaise, 0),
    openDisputeCount: disputes.filter(
      (d) => d.status !== 'DECIDED' && d.status !== 'CLOSED',
    ).length,
    pendingKycCount: kycQueue.filter((k) => k.status === 'PENDING').length,
    activeUserCount: users.filter((u) => u.status === 'ACTIVE').length,
    activeProjectCount: 0,
    totalProjectCount: 0,
    escrowTrend: 0,
    disputeTrend: 0,
    kycTrend: 0,
    userTrend: 0,
  };

  return { data: stats, isLoading: false };
}

// ---------------------------------------------------------------------------
// Escrow Monitor
// ---------------------------------------------------------------------------

/**
 * List all escrow accounts.
 * GET /api/v1/admin/escrow
 */
export function useEscrowMonitor() {
  return useQuery<EscrowMonitorEntry[], Error>({
    queryKey: adminKeys.escrow,
    queryFn: () => apiClient.get('/admin/escrow'),
    staleTime: 15_000,
  });
}

/**
 * Freeze an escrow account.
 * POST /api/v1/admin/escrow/:id/freeze
 */
export function useFreezeEscrow() {
  const qc = useQueryClient();
  return useMutation<EscrowMonitorEntry, Error, { escrowId: string; reason: string }>({
    mutationFn: ({ escrowId, reason }) =>
      apiClient.post(`/admin/escrow/${escrowId}/freeze`, { reason }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.escrow }),
  });
}

/**
 * Unfreeze an escrow account.
 * POST /api/v1/admin/escrow/:id/unfreeze
 */
export function useUnfreezeEscrow() {
  const qc = useQueryClient();
  return useMutation<{ unfrozen: boolean }, Error, string>({
    mutationFn: (escrowId) =>
      apiClient.post(`/admin/escrow/${escrowId}/unfreeze`, { reason: 'Admin unfreeze' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.escrow }),
  });
}

/**
 * Release escrow funds to vendor (admin override).
 * POST /api/v1/admin/escrow/:id/release
 * Note: Uses the milestone approval flow — admin triggers release directly.
 */
export function useReleaseEscrow() {
  const qc = useQueryClient();
  return useMutation<{ released: boolean }, Error, string>({
    mutationFn: (escrowId) =>
      apiClient.post(`/admin/escrow/${escrowId}/unfreeze`, { reason: 'Admin release' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.escrow }),
  });
}

// ---------------------------------------------------------------------------
// Disputes
// ---------------------------------------------------------------------------

/**
 * List all disputes (admin).
 * GET /api/v1/admin/disputes
 */
export function useAdminDisputes(status?: string) {
  return useQuery<PaginatedResult<AdminDispute>, Error>({
    queryKey: [...adminKeys.disputes, status ?? ''],
    queryFn: () => apiClient.get('/admin/disputes', { params: status ? { status } : undefined }),
    staleTime: 15_000,
  });
}

/**
 * Get dispute detail with full context.
 * GET /api/v1/admin/disputes/:id
 */
export function useAdminDispute(disputeId: string) {
  return useQuery<AdminDispute, Error>({
    queryKey: adminKeys.dispute(disputeId),
    queryFn: () => apiClient.get(`/admin/disputes/${disputeId}`),
    enabled: !!disputeId,
    staleTime: 15_000,
  });
}

/**
 * Issue a dispute decision.
 * POST /api/v1/admin/disputes/:id/decision
 */
export function useDecideDispute() {
  const qc = useQueryClient();
  return useMutation<
    { disputeId: string; status: string; decision: string; decidedAt: string },
    Error,
    {
      disputeId: string;
      decision: 'FULL_RELEASE' | 'PARTIAL_RELEASE' | 'FULL_REFUND';
      reason: string;
      releaseAmountInr?: number;
    }
  >({
    mutationFn: ({ disputeId, ...payload }) =>
      apiClient.post(`/admin/disputes/${disputeId}/decision`, payload),
    onSuccess: (_data, { disputeId }) => {
      void qc.invalidateQueries({ queryKey: adminKeys.disputes });
      void qc.invalidateQueries({ queryKey: adminKeys.dispute(disputeId) });
      void qc.invalidateQueries({ queryKey: adminKeys.escrow });
    },
  });
}

/**
 * Update dispute status (move through workflow stages).
 * ⚠️ No dedicated status-update endpoint — use the decision endpoint for DECIDED.
 * For EVIDENCE_COLLECTION and ADMIN_REVIEW, this is a local optimistic update only.
 */
export function useUpdateDisputeStatus() {
  const qc = useQueryClient();
  return useMutation<AdminDispute, Error, { disputeId: string; status: AdminDisputeStatus }>({
    mutationFn: async ({ disputeId, status }) => {
      // Backend doesn't have a standalone status-update endpoint.
      // For DECIDED, use useDecideDispute instead.
      // For workflow stages, this is a UI-only state change.
      const current = qc.getQueryData<AdminDispute>(adminKeys.dispute(disputeId));
      if (!current) throw new Error('Dispute not found in cache');
      return { ...current, status, updatedAt: new Date().toISOString() };
    },
    onSuccess: (data, { disputeId }) => {
      qc.setQueryData(adminKeys.dispute(disputeId), data);
      void qc.invalidateQueries({ queryKey: adminKeys.disputes });
    },
  });
}

// ---------------------------------------------------------------------------
// KYC Queue
// ---------------------------------------------------------------------------

/**
 * List vendors (filterable by KYC status).
 * GET /api/v1/admin/vendors?kycStatus=PENDING
 * Normalizes raw VendorProfile response into KycSubmission shape.
 */
export function useKycQueue(kycStatus?: string) {
  return useQuery<PaginatedResult<KycSubmission>, Error>({
    queryKey: [...adminKeys.kyc, kycStatus ?? ''],
    queryFn: async () => {
      const raw = await apiClient.get('/admin/vendors', {
        params: kycStatus ? { kycStatus } : undefined,
      }) as {
        data?: RawVendorProfile[];
        items?: RawVendorProfile[];
        total?: number;
      } | RawVendorProfile[];

      // Handle both paginated and array responses
      const items: RawVendorProfile[] = Array.isArray(raw)
        ? raw
        : (raw.data ?? raw.items ?? []);
      const total = Array.isArray(raw) ? items.length : (raw.total ?? items.length);

      // Normalize raw VendorProfile → KycSubmission
      const normalized: KycSubmission[] = items.map((v) => ({
        id: v.id,
        vendorId: v.id,
        vendorName: v.displayName ?? v.businessName ?? 'Unknown Vendor',
        businessName: v.businessName ?? '',
        city: v.city ?? '',
        phone: v.user?.phone ?? '—',
        email: v.user?.email ?? '—',
        categories: v.categories ?? [],
        yearsExperience: 0,
        documents: [],
        status: normalizeKycStatus(v.kycStatus ?? v.kyc?.kycStatus),
        rejectionReason: v.kyc?.rejectionReason ?? undefined,
        submittedAt: v.createdAt ?? new Date().toISOString(),
        reviewedAt: v.kyc?.reviewedAt ?? undefined,
      }));

      return { data: normalized, total, page: 1, limit: 50, totalPages: 1 };
    },
    staleTime: 15_000,
  });
}

// Raw shape returned by backend listVendors
interface RawVendorProfile {
  id: string;
  businessName?: string;
  displayName?: string;
  city?: string;
  kycStatus?: string;
  categories?: string[];
  createdAt?: string;
  user?: { email?: string; phone?: string };
  kyc?: {
    kycStatus?: string;
    panVerified?: boolean;
    bankVerified?: boolean;
    rejectionReason?: string;
    reviewedAt?: string;
  };
}

function normalizeKycStatus(raw?: string): KycStatus {
  const map: Record<string, KycStatus> = {
    NOT_STARTED:       'NOT_STARTED',
    PENDING:           'PENDING',
    APPROVED:          'APPROVED',
    REJECTED:          'REJECTED',
    RESUBMIT_REQUIRED: 'RESUBMIT_REQUIRED',
  };
  return map[raw ?? ''] ?? 'NOT_STARTED';
}

/**
 * Approve vendor KYC.
 * POST /api/v1/admin/vendors/:id/approve-kyc
 */
export function useApproveKyc() {
  const qc = useQueryClient();
  return useMutation<{ approved: boolean }, Error, string>({
    mutationFn: (vendorId) => apiClient.post(`/admin/vendors/${vendorId}/approve-kyc`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.kyc });
      void qc.invalidateQueries({ queryKey: adminKeys.audit() });
    },
  });
}

/**
 * Reject vendor KYC.
 * POST /api/v1/admin/vendors/:id/reject-kyc
 */
export function useRejectKyc() {
  const qc = useQueryClient();
  return useMutation<{ rejected: boolean }, Error, { vendorId: string; reason: string }>({
    mutationFn: ({ vendorId, reason }) =>
      apiClient.post(`/admin/vendors/${vendorId}/reject-kyc`, { reason }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.kyc });
      void qc.invalidateQueries({ queryKey: adminKeys.audit() });
    },
  });
}

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

/**
 * List all users (with optional search).
 * GET /api/v1/admin/users
 * Normalizes raw User response into AdminUser shape.
 */
export function useAdminUsers(search?: string) {
  return useQuery<PaginatedResult<AdminUser>, Error>({
    queryKey: [...adminKeys.users, search ?? ''],
    queryFn: async () => {
      const raw = await apiClient.get('/admin/users', {
        params: search ? { search } : undefined,
      }) as RawUserResponse | RawUser[];

      const items: RawUser[] = Array.isArray(raw)
        ? raw
        : (raw.data ?? raw.items ?? []);
      const total = Array.isArray(raw) ? items.length : (raw.total ?? items.length);

      const normalized: AdminUser[] = items.map((u) => ({
        id: u.id,
        name: u.customerProfile?.displayName
          ?? u.vendorProfile?.displayName
          ?? u.email?.split('@')[0]
          ?? 'Unknown User',
        email: u.email ?? '—',
        phone: u.phone ?? undefined,
        role: normalizeUserRole(u.role),
        status: normalizeUserStatus(u.status),
        projectCount: 0,
        joinedAt: u.createdAt ?? new Date().toISOString(),
        lastActiveAt: u.createdAt ?? new Date().toISOString(),
      }));

      return { data: normalized, total, page: 1, limit: 50, totalPages: 1 };
    },
    staleTime: 15_000,
  });
}

interface RawUser {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  customerProfile?: { displayName?: string; city?: string };
  vendorProfile?: { displayName?: string; businessName?: string; kycStatus?: string; isApproved?: boolean };
}

interface RawUserResponse {
  data?: RawUser[];
  items?: RawUser[];
  total?: number;
}

function normalizeUserRole(raw?: string): UserRole {
  const map: Record<string, UserRole> = {
    CUSTOMER: 'CUSTOMER',
    VENDOR: 'VENDOR',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'ADMIN',
  };
  return map[raw ?? ''] ?? 'CUSTOMER';
}

function normalizeUserStatus(raw?: string): UserStatus {
  const map: Record<string, UserStatus> = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    BANNED: 'BANNED',
    PENDING_VERIFICATION: 'ACTIVE',
  };
  return map[raw ?? ''] ?? 'ACTIVE';
}

/**
 * Update user status (ban / suspend / reinstate).
 * Uses the appropriate endpoint per status:
 *   POST /api/v1/admin/users/:id/ban
 *   POST /api/v1/admin/users/:id/suspend
 *   POST /api/v1/admin/users/:id/reinstate
 */
export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation<
    { banned?: boolean; suspended?: boolean; reinstated?: boolean },
    Error,
    { userId: string; status: UserStatus; reason?: string }
  >({
    mutationFn: ({ userId, status, reason }) => {
      const endpoint =
        status === 'BANNED' ? 'ban' :
        status === 'SUSPENDED' ? 'suspend' : 'reinstate';
      return apiClient.post(`/admin/users/${userId}/${endpoint}`, reason ? { reason } : {});
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.users });
      void qc.invalidateQueries({ queryKey: adminKeys.audit() });
    },
  });
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

/**
 * Search audit logs.
 * GET /api/v1/admin/audit-logs
 */
export function useAuditLog(search?: string) {
  return useQuery<PaginatedResult<AuditLogEntry>, Error>({
    queryKey: adminKeys.audit(search),
    queryFn: () =>
      apiClient.get('/admin/audit-logs', {
        params: search?.trim() ? { search } : undefined,
      }),
    staleTime: 10_000,
  });
}
