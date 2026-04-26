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
  AdminUser,
  AuditLogEntry,
  AdminDisputeStatus,
  UserStatus,
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
  const { data: escrows } = useEscrowMonitor();
  const { data: disputes } = useAdminDisputes();
  const { data: kycQueue } = useKycQueue();
  const { data: users } = useAdminUsers();

  const stats: AdminDashboardStats = {
    totalEscrowPaise: (escrows ?? []).reduce((s, e) => s + e.amountPaise, 0),
    activeEscrowPaise: (escrows ?? [])
      .filter((e) => e.status === 'FUNDED' || e.status === 'HELD')
      .reduce((s, e) => s + e.amountPaise, 0),
    openDisputeCount: (disputes?.data ?? []).filter(
      (d) => d.status !== 'DECIDED' && d.status !== 'CLOSED',
    ).length,
    pendingKycCount: (kycQueue?.data ?? []).filter((k) => k.status === 'PENDING').length,
    activeUserCount: (users?.data ?? []).filter((u) => u.status === 'ACTIVE').length,
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
  return useMutation<EscrowMonitorEntry, Error, { escrowId: string; reason: string }>({
    mutationFn: ({ escrowId, reason }) =>
      apiClient.post(`/admin/escrow/${escrowId}/unfreeze`, { reason }),
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
 */
export function useKycQueue(kycStatus = 'PENDING') {
  return useQuery<PaginatedResult<KycSubmission>, Error>({
    queryKey: [...adminKeys.kyc, kycStatus],
    queryFn: () => apiClient.get('/admin/vendors', { params: { kycStatus } }),
    staleTime: 15_000,
  });
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
 */
export function useAdminUsers(search?: string) {
  return useQuery<PaginatedResult<AdminUser>, Error>({
    queryKey: [...adminKeys.users, search ?? ''],
    queryFn: () => apiClient.get('/admin/users', { params: search ? { search } : undefined }),
    staleTime: 15_000,
  });
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
