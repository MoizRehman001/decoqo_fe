/**
 * User / Vendor Profile API — real apiClient calls.
 * Endpoints verified against:
 *   Decoqo_be/apps/api/src/modules/user/user.controller.ts
 *   Decoqo_be/apps/api/src/modules/vendor/vendor.controller.ts
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const userKeys = {
  me: ['user', 'me'] as const,
};

export const vendorKeys = {
  me: ['vendor', 'me'] as const,
  kycStatus: ['vendor', 'kyc-status'] as const,
  public: (vendorId: string) => ['vendor', 'public', vendorId] as const,
};

// ---------------------------------------------------------------------------
// Customer / User Hooks
// ---------------------------------------------------------------------------

/** GET /api/v1/users/me */
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => apiClient.get('/users/me'),
    staleTime: 60_000,
  });
}

/** PATCH /api/v1/users/me */
export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { displayName?: string; city?: string }>({
    mutationFn: (data) => apiClient.patch('/users/me', data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: userKeys.me }),
  });
}

// ---------------------------------------------------------------------------
// Vendor Hooks
// ---------------------------------------------------------------------------

/** GET /api/v1/vendors/me */
export function useVendorProfile() {
  return useQuery({
    queryKey: vendorKeys.me,
    queryFn: () => apiClient.get('/vendors/me'),
    staleTime: 60_000,
  });
}

/** PATCH /api/v1/vendors/me */
export function useUpdateVendorProfile() {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { bio?: string; serviceAreas?: string[]; categories?: string[]; websiteUrl?: string }
  >({
    mutationFn: (data) => apiClient.patch('/vendors/me', data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: vendorKeys.me }),
  });
}

/** POST /api/v1/vendors/kyc */
export function useSubmitKyc() {
  const qc = useQueryClient();
  return useMutation<
    { submitted: boolean; panVerified: boolean; bankVerified: boolean },
    Error,
    { panNumber: string; bankAccountNumber: string; bankIfsc: string; businessProofUrl?: string }
  >({
    mutationFn: (data) => apiClient.post('/vendors/kyc', data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: vendorKeys.kycStatus }),
  });
}

/** GET /api/v1/vendors/kyc/status */
export function useVendorKycStatus() {
  return useQuery({
    queryKey: vendorKeys.kycStatus,
    queryFn: () => apiClient.get('/vendors/kyc/status'),
    staleTime: 30_000,
  });
}

/** POST /api/v1/vendors/me/portfolio — add portfolio image URL */
export function useAddPortfolioItem() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (fileUrl) => apiClient.post('/vendors/me/portfolio', { fileUrl }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: vendorKeys.me }),
  });
}

/** POST /api/v1/vendors/me/portfolio/remove — remove portfolio image URL */
export function useRemovePortfolioItem() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (fileUrl) => apiClient.post('/vendors/me/portfolio/remove', { fileUrl }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: vendorKeys.me }),
  });
}

/** GET /api/v1/vendors/:id/public — post-selection revealed profile */
export function useVendorPublicProfile(vendorId: string) {
  return useQuery({
    queryKey: vendorKeys.public(vendorId),
    queryFn: () => apiClient.get(`/vendors/${vendorId}/public`),
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Admin vendor detail
// ---------------------------------------------------------------------------

/** GET /api/v1/admin/vendors/:id */
export function useAdminVendorDetail(vendorId: string) {
  return useQuery({
    queryKey: ['admin', 'vendor', vendorId],
    queryFn: () => apiClient.get(`/admin/vendors/${vendorId}`),
    enabled: !!vendorId,
    staleTime: 30_000,
  });
}

/** GET /api/v1/admin/users/:id */
export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => apiClient.get(`/admin/users/${userId}`),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

/** POST /api/v1/admin/vendors/:id/suspend */
export function useAdminSuspendVendor() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { vendorId: string; reason: string }>({
    mutationFn: ({ vendorId, reason }) =>
      apiClient.post(`/admin/vendors/${vendorId}/suspend`, { reason }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'kyc'] }),
  });
}
