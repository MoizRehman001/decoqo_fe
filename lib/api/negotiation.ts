/**
 * Negotiation + Milestone API — real apiClient calls.
 * Endpoints verified against:
 *   Decoqo_be/apps/api/src/modules/negotiation/negotiation.controller.ts
 *   Decoqo_be/apps/api/src/modules/milestone/milestone.controller.ts
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type {
  NegotiationThread,
  NegotiationMessage,
  NegotiationProposal,
  Milestone,
  MilestoneEvidence,
  Dispute,
  DisputeReason,
} from '@/types/negotiation.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const negotiationKeys = {
  all: ['negotiation'] as const,
  thread: (projectId: string) => [...negotiationKeys.all, 'thread', projectId] as const,
};

export const milestoneKeys = {
  all: ['milestones'] as const,
  byProject: (projectId: string) => [...milestoneKeys.all, 'project', projectId] as const,
  detail: (id: string) => [...milestoneKeys.all, 'detail', id] as const,
};

// ---------------------------------------------------------------------------
// Negotiation Hooks
// ---------------------------------------------------------------------------

/**
 * Get the negotiation thread for a project.
 * GET /api/v1/projects/:id/negotiation
 */
export function useNegotiationThread(projectId: string) {
  return useQuery<NegotiationThread | null, Error>({
    queryKey: negotiationKeys.thread(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/negotiation`),
    enabled: !!projectId,
    staleTime: 15_000,
    refetchInterval: 10_000,
  });
}

/**
 * Send a negotiation message (contact info auto-masked by backend).
 * POST /api/v1/projects/:id/negotiation/messages
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation<NegotiationMessage, Error, { projectId: string; content: string }>({
    mutationFn: ({ projectId, content }) =>
      apiClient.post(`/projects/${projectId}/negotiation/messages`, { content }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
    },
  });
}

/**
 * Vendor submits a revised proposal.
 * POST /api/v1/projects/:id/negotiation/proposals
 */
export function useSubmitProposal() {
  const queryClient = useQueryClient();
  return useMutation<
    NegotiationProposal,
    Error,
    {
      projectId: string;
      totalQuoteInr: number;
      timelineWeeks: number;
      materialLevel: 'ECONOMY' | 'STANDARD' | 'PREMIUM';
      notes?: string;
    }
  >({
    mutationFn: ({ projectId, ...payload }) =>
      apiClient.post(`/projects/${projectId}/negotiation/proposals`, payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
    },
  });
}

/**
 * Customer accepts a proposal.
 * POST /api/v1/projects/:id/negotiation/proposals/:proposalId/accept
 */
export function useRespondToProposal() {
  const queryClient = useQueryClient();
  return useMutation<
    { accepted: boolean },
    Error,
    { projectId: string; proposalId: string }
  >({
    mutationFn: ({ projectId, proposalId }) =>
      apiClient.post(`/projects/${projectId}/negotiation/proposals/${proposalId}/accept`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
    },
  });
}

/**
 * Confirm negotiation complete — both parties must call this.
 * POST /api/v1/projects/:id/negotiation/confirm
 */
export function useConfirmNegotiation() {
  const queryClient = useQueryClient();
  return useMutation<
    { confirmed: boolean },
    Error,
    { projectId: string; role: 'CUSTOMER' | 'VENDOR' }
  >({
    mutationFn: ({ projectId }) =>
      apiClient.post(`/projects/${projectId}/negotiation/confirm`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Milestone Hooks
// ---------------------------------------------------------------------------

/**
 * List milestones for a project.
 * GET /api/v1/projects/:id/milestones
 */
export function useMilestones(projectId: string) {
  return useQuery<Milestone[], Error>({
    queryKey: milestoneKeys.byProject(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/milestones`),
    enabled: !!projectId,
    staleTime: 15_000,
  });
}

/**
 * Get a single milestone.
 * Uses the project list cache — no dedicated single-milestone GET endpoint exists.
 */
export function useMilestone(milestoneId: string) {
  const queryClient = useQueryClient();
  return useQuery<Milestone, Error>({
    queryKey: milestoneKeys.detail(milestoneId),
    queryFn: async () => {
      // Search all cached milestone lists for this milestone
      const cache = queryClient.getQueriesData<Milestone[]>({ queryKey: milestoneKeys.all });
      for (const [, milestones] of cache) {
        const found = milestones?.find((m) => m.id === milestoneId);
        if (found) return found;
      }
      // Fallback: not in cache — this shouldn't happen in normal flow
      throw new Error(`Milestone ${milestoneId} not found in cache`);
    },
    enabled: !!milestoneId,
    staleTime: 15_000,
  });
}

/**
 * Create a milestone.
 * POST /api/v1/projects/:id/milestones
 */
export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation<
    Milestone,
    Error,
    { projectId: string; name: string; description?: string; percentage: number }
  >({
    mutationFn: ({ projectId, ...data }) =>
      apiClient.post(`/projects/${projectId}/milestones`, data),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

/**
 * Lock all milestones (vendor action — requires 100% total).
 * POST /api/v1/projects/:id/milestones/lock
 */
export function useLockMilestones() {
  const queryClient = useQueryClient();
  return useMutation<{ locked: boolean; count: number }, Error, string>({
    mutationFn: (projectId) => apiClient.post(`/projects/${projectId}/milestones/lock`),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Vendor starts a milestone (after escrow is funded).
 * POST /api/v1/milestones/:id/start
 */
export function useStartMilestone() {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, { milestoneId: string; projectId: string }>({
    mutationFn: ({ milestoneId }) => apiClient.post(`/milestones/${milestoneId}/start`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

/**
 * Upload evidence for a milestone (after presign + S3 upload).
 * POST /api/v1/milestones/:id/evidence
 * fileUrl is the CDN URL returned after the S3 upload completes.
 */
export function useUploadEvidence() {
  const queryClient = useQueryClient();
  return useMutation<
    MilestoneEvidence,
    Error,
    {
      milestoneId: string;
      projectId: string;
      fileUrl: string;
      fileName: string;
      fileSizeKb: number;
      mimeType: string;
      description?: string;
    }
  >({
    mutationFn: ({ milestoneId, projectId: _pid, ...body }) =>
      apiClient.post(`/milestones/${milestoneId}/evidence`, body),
    onSuccess: (_data, { milestoneId, projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.detail(milestoneId) });
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

/**
 * Vendor submits a milestone for customer review.
 * POST /api/v1/milestones/:id/submit
 */
export function useSubmitMilestone() {
  const queryClient = useQueryClient();
  return useMutation<
    Milestone,
    Error,
    { milestoneId: string; projectId: string; completionNotes: string; evidenceIds: string[] }
  >({
    mutationFn: ({ milestoneId, completionNotes, evidenceIds }) =>
      apiClient.post(`/milestones/${milestoneId}/submit`, { completionNotes, evidenceIds }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

/**
 * Customer approves a submitted milestone (triggers escrow release).
 * POST /api/v1/milestones/:id/approve
 */
export function useApproveMilestone() {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, { milestoneId: string; projectId: string }>({
    mutationFn: ({ milestoneId }) => apiClient.post(`/milestones/${milestoneId}/approve`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Customer requests changes on a submitted milestone.
 * POST /api/v1/milestones/:id/request-changes
 */
export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, { milestoneId: string; notes: string; projectId: string }>({
    mutationFn: ({ milestoneId, notes }) =>
      apiClient.post(`/milestones/${milestoneId}/request-changes`, { notes }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

/**
 * Raise a dispute on a milestone.
 * POST /api/v1/disputes
 */
export function useRaiseDispute() {
  const queryClient = useQueryClient();
  return useMutation<
    Dispute,
    Error,
    { milestoneId: string; reason: DisputeReason; description: string; projectId: string }
  >({
    mutationFn: ({ milestoneId, reason, description }) =>
      apiClient.post('/disputes', { milestoneId, reason, description }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

// Re-export for backward compatibility
export type CreateMilestonePayload = {
  projectId: string;
  name: string;
  description?: string;
  percentage: number;
};
