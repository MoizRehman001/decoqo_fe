/**
 * Bidding + AI Design API — real apiClient calls.
 * Endpoints verified against:
 *   Decoqo_be/apps/api/src/modules/bidding/bidding.controller.ts
 *   Decoqo_be/apps/api/src/modules/ai-design/ai-design.controller.ts
 *
 * ANONYMITY CONTRACT:
 *   - GET /projects/:id/bidding-room — never includes vendorId
 *   - GET /projects/:id/bids/:bidId/vendor-preview — safe fields only
 *   - vendorId is revealed ONLY via POST /projects/:id/bids/:bidId/select
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toSafeBids, type SafeBid } from '@/lib/utils/anonymity';
import type { Bid, AiDesign, VendorProfile, BiddingRoom, SubmitBidPayload } from '@/types/bidding.types';
import type { PaginatedResult } from '@/types/api.types';
import type { Project } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const biddingKeys = {
  all: ['bidding'] as const,
  room: (projectId: string) => [...biddingKeys.all, 'room', projectId] as const,
  vendorPreview: (projectId: string, bidId: string) =>
    [...biddingKeys.all, 'vendor-preview', projectId, bidId] as const,
  vendorPublic: (vendorId: string) => [...biddingKeys.all, 'vendor-public', vendorId] as const,
  myBids: () => [...biddingKeys.all, 'my-bids'] as const,
  available: () => [...biddingKeys.all, 'available'] as const,
};

export const aiDesignKeys = {
  all: ['ai-designs'] as const,
  byProject: (projectId: string) => [...aiDesignKeys.all, 'project', projectId] as const,
};

// ---------------------------------------------------------------------------
// Bidding Room — Customer
// ---------------------------------------------------------------------------

/**
 * Get the full bidding room state (anonymized bids).
 * GET /api/v1/projects/:id/bidding-room
 * vendorId is NEVER included in the response.
 */
export function useBiddingRoom(projectId: string) {
  return useQuery<BiddingRoom, Error>({
    queryKey: biddingKeys.room(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/bidding-room`),
    enabled: !!projectId,
    staleTime: 15_000,
    refetchInterval: 30_000,
    select: (data) => ({
      ...data,
      // Enforce anonymity at the data boundary
      bids: toSafeBids(data.bids ?? []) as unknown as Bid[],
    }),
  });
}

/**
 * Get vendor profile card — safe fields only, no contact info.
 * GET /api/v1/projects/:id/bids/:bidId/vendor-preview
 * Server resolves vendorId internally — client never sees it.
 */
export function useVendorProfileByBidId(projectId: string, bidId: string) {
  return useQuery<VendorProfile, Error>({
    queryKey: biddingKeys.vendorPreview(projectId, bidId),
    queryFn: () => apiClient.get(`/projects/${projectId}/bids/${bidId}/vendor-preview`),
    enabled: !!projectId && !!bidId,
    staleTime: 60_000,
  });
}

/**
 * Get public vendor profile — revealed ONLY after vendor selection.
 * GET /api/v1/vendors/:id/public
 */
export function useVendorProfile(vendorId: string) {
  return useQuery<VendorProfile, Error>({
    queryKey: biddingKeys.vendorPublic(vendorId),
    queryFn: () => apiClient.get(`/vendors/${vendorId}/public`),
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}

/** Shortlist a bid. POST /api/v1/projects/:id/bids/:bidId/shortlist */
export function useShortlistBid() {
  const queryClient = useQueryClient();
  return useMutation<{ shortlisted: boolean }, Error, { projectId: string; bidId: string }>({
    mutationFn: ({ projectId, bidId }) =>
      apiClient.post(`/projects/${projectId}/bids/${bidId}/shortlist`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.room(projectId) });
    },
  });
}

/**
 * Select vendor — reveals vendor identity.
 * POST /api/v1/projects/:id/bids/:bidId/select
 * Response includes vendor contact details + negotiationThreadId.
 */
export function useSelectVendor() {
  const queryClient = useQueryClient();
  return useMutation<
    {
      bidId: string;
      projectStatus: string;
      vendor: { id: string; businessName: string; displayName: string; city: string; phone: string | null; email: string | null };
      negotiationThreadId: string;
      selectedAt: string;
    },
    Error,
    { projectId: string; bidId: string }
  >({
    mutationFn: ({ projectId, bidId }) =>
      apiClient.post(`/projects/${projectId}/bids/${bidId}/select`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.room(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Bidding — Vendor
// ---------------------------------------------------------------------------

/**
 * Browse published projects available for bidding.
 * GET /api/v1/projects/available
 */
export function useAvailableProjects(filters?: { city?: string; budgetMin?: number; budgetMax?: number }) {
  return useQuery<PaginatedResult<Project>, Error>({
    queryKey: [...biddingKeys.available(), filters],
    queryFn: () => apiClient.get('/projects/available', { params: filters }),
    staleTime: 30_000,
  });
}

/**
 * List the vendor's own bids.
 * GET /api/v1/bids/mine
 */
export function useMyBids() {
  return useQuery<PaginatedResult<Bid>, Error>({
    queryKey: biddingKeys.myBids(),
    queryFn: () => apiClient.get('/bids/mine'),
    staleTime: 30_000,
  });
}

/**
 * Submit an anonymous bid with full BOQ.
 * POST /api/v1/bids
 */
export function useSubmitBid() {
  const queryClient = useQueryClient();
  return useMutation<{ bidId: string; status: string; submittedAt: string }, Error, SubmitBidPayload>({
    mutationFn: (payload) => apiClient.post('/bids', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.myBids() });
    },
  });
}

/**
 * Withdraw a bid (before selection).
 * DELETE /api/v1/bids/:id
 */
export function useWithdrawBid() {
  const queryClient = useQueryClient();
  return useMutation<{ withdrawn: boolean }, Error, string>({
    mutationFn: (bidId) => apiClient.delete(`/bids/${bidId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.myBids() });
    },
  });
}

// ---------------------------------------------------------------------------
// AI Design
// ---------------------------------------------------------------------------

/**
 * List generated designs for a project.
 * GET /api/v1/projects/:id/designs
 */
export function useAiDesigns(projectId: string) {
  return useQuery<AiDesign[], Error>({
    queryKey: aiDesignKeys.byProject(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/designs`),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * Queue AI design generation (async — returns jobId).
 * POST /api/v1/projects/:id/design/generate
 * Returns 202 Accepted. Listen for design.generation.complete WebSocket event.
 */
export function useGenerateDesigns() {
  const queryClient = useQueryClient();
  return useMutation<
    { jobId: string; estimatedSeconds: number; status: string },
    Error,
    { projectId: string; themeText: string; filters: AiDesign['filters'] }
  >({
    mutationFn: ({ projectId, themeText, filters }) =>
      apiClient.post(`/projects/${projectId}/design/generate`, { themeText, filters }),
    onSuccess: (_data, { projectId }) => {
      // Invalidate after a short delay to allow the job to start
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: aiDesignKeys.byProject(projectId) });
      }, 2000);
    },
  });
}

/**
 * Lock the selected design (irreversible).
 * POST /api/v1/projects/:id/design/lock
 */
export function useLockDesign() {
  const queryClient = useQueryClient();
  return useMutation<
    { designId: string; lockedAt: string; projectStatus: string },
    Error,
    { projectId: string; designId: string }
  >({
    mutationFn: ({ projectId, designId }) =>
      apiClient.post(`/projects/${projectId}/design/lock`, { designId }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: aiDesignKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects', 'detail', projectId] });
    },
  });
}

// Keep legacy hook names for backward compatibility with existing components
export { useVendorProfileByBidId as useVendorProfileByBidIdLegacy };
export type { SafeBid };
