/**
 * Disputes API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/dispute/dispute.controller.ts
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { Dispute, DisputeReason } from '@/types/negotiation.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const disputeKeys = {
  all: ['disputes'] as const,
  detail: (id: string) => [...disputeKeys.all, 'detail', id] as const,
  evidence: (id: string) => [...disputeKeys.all, 'evidence', id] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Get dispute detail. GET /api/v1/disputes/:id */
export function useDispute(disputeId: string) {
  return useQuery<Dispute, Error>({
    queryKey: disputeKeys.detail(disputeId),
    queryFn: () => apiClient.get(`/disputes/${disputeId}`),
    enabled: !!disputeId,
    staleTime: 15_000,
  });
}

/** List evidence for a dispute. GET /api/v1/disputes/:id/evidence */
export function useDisputeEvidence(disputeId: string) {
  return useQuery({
    queryKey: disputeKeys.evidence(disputeId),
    queryFn: () => apiClient.get(`/disputes/${disputeId}/evidence`),
    enabled: !!disputeId,
    staleTime: 30_000,
  });
}

/**
 * Raise a dispute on a milestone.
 * POST /api/v1/disputes
 */
export function useRaiseDispute() {
  const queryClient = useQueryClient();
  return useMutation<
    { disputeId: string; status: string; escrowStatus: string; createdAt: string },
    Error,
    { milestoneId: string; reason: DisputeReason; description: string; projectId: string }
  >({
    mutationFn: ({ milestoneId, reason, description }) =>
      apiClient.post('/disputes', { milestoneId, reason, description }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: ['milestones', 'project', projectId] });
    },
  });
}

/**
 * Upload evidence for a dispute (after presign + S3 upload).
 * POST /api/v1/disputes/:id/evidence
 * fileUrl is the CDN URL returned after the S3 upload completes.
 */
export function useUploadDisputeEvidence() {
  const queryClient = useQueryClient();
  return useMutation<
    { id: string; fileUrl: string; fileName: string; uploadedAt: string },
    Error,
    { disputeId: string; fileUrl: string; fileName: string; description?: string }
  >({
    mutationFn: ({ disputeId, ...body }) =>
      apiClient.post(`/disputes/${disputeId}/evidence`, body),
    onSuccess: (_data, { disputeId }) => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.evidence(disputeId) });
      void queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    },
  });
}
