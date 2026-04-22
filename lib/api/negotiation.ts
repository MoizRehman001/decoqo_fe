/**
 * Negotiation + Milestone API — TanStack Query keys + hooks.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mockNegotiationApi,
  mockMilestoneApi,
  type SendMessagePayload,
  type SubmitProposalPayload,
  type CreateMilestonePayload,
  type SubmitMilestonePayload,
} from '@/mock/mockData';
import type {
  NegotiationThread,
  NegotiationMessage,
  NegotiationProposal,
  Milestone,
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

export function useNegotiationThread(projectId: string) {
  return useQuery<NegotiationThread | null, Error>({
    queryKey: negotiationKeys.thread(projectId),
    queryFn: () => mockNegotiationApi.getThread(projectId),
    enabled: !!projectId,
    staleTime: 15_000,
    refetchInterval: 10_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation<NegotiationMessage, Error, SendMessagePayload & { projectId: string }>({
    mutationFn: ({ threadId, content }) => mockNegotiationApi.sendMessage({ threadId, content }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
    },
  });
}

export function useSubmitProposal() {
  const queryClient = useQueryClient();
  return useMutation<NegotiationProposal, Error, SubmitProposalPayload & { projectId: string }>({
    mutationFn: ({ threadId, quotePaise, timelineWeeks, materialLevel, notes }) =>
      mockNegotiationApi.submitProposal({ threadId, quotePaise, timelineWeeks, materialLevel, notes }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
    },
  });
}

export function useRespondToProposal() {
  const queryClient = useQueryClient();
  return useMutation<
    NegotiationProposal,
    Error,
    { proposalId: string; action: 'ACCEPTED' | 'COUNTERED' | 'DECLINED'; projectId: string }
  >({
    mutationFn: ({ proposalId, action }) => mockNegotiationApi.respondToProposal(proposalId, action),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
    },
  });
}

export function useConfirmNegotiation() {
  const queryClient = useQueryClient();
  return useMutation<
    NegotiationThread,
    Error,
    { threadId: string; role: 'CUSTOMER' | 'VENDOR'; projectId: string }
  >({
    mutationFn: ({ threadId, role }) => mockNegotiationApi.confirmNegotiation(threadId, role),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Milestone Hooks
// ---------------------------------------------------------------------------

export function useMilestones(projectId: string) {
  return useQuery<Milestone[], Error>({
    queryKey: milestoneKeys.byProject(projectId),
    queryFn: () => mockMilestoneApi.getMilestones(projectId),
    enabled: !!projectId,
    staleTime: 15_000,
  });
}

export function useMilestone(milestoneId: string) {
  return useQuery<Milestone, Error>({
    queryKey: milestoneKeys.detail(milestoneId),
    queryFn: () => mockMilestoneApi.getMilestone(milestoneId),
    enabled: !!milestoneId,
    staleTime: 15_000,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, CreateMilestonePayload>({
    mutationFn: (data) => mockMilestoneApi.createMilestone(data),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

export function useLockMilestones() {
  const queryClient = useQueryClient();
  return useMutation<Milestone[], Error, string>({
    mutationFn: (projectId) => mockMilestoneApi.lockMilestones(projectId),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUploadEvidence() {
  const queryClient = useQueryClient();
  return useMutation<
    import('@/types/negotiation.types').MilestoneEvidence,
    Error,
    { milestoneId: string; fileName: string; projectId: string }
  >({
    mutationFn: ({ milestoneId, fileName }) => mockMilestoneApi.uploadEvidence(milestoneId, fileName),
    onSuccess: (_data, { milestoneId, projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.detail(milestoneId) });
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

export function useSubmitMilestone() {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, SubmitMilestonePayload & { projectId: string }>({
    mutationFn: ({ milestoneId, completionNotes, evidenceIds }) =>
      mockMilestoneApi.submitMilestone({ milestoneId, completionNotes, evidenceIds }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

export function useApproveMilestone() {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, { milestoneId: string; projectId: string }>({
    mutationFn: ({ milestoneId }) => mockMilestoneApi.approveMilestone(milestoneId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation<Milestone, Error, { milestoneId: string; notes: string; projectId: string }>({
    mutationFn: ({ milestoneId, notes }) => mockMilestoneApi.requestChanges(milestoneId, notes),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

export function useRaiseDispute() {
  const queryClient = useQueryClient();
  return useMutation<
    Dispute,
    Error,
    { milestoneId: string; reason: DisputeReason; description: string; projectId: string }
  >({
    mutationFn: ({ milestoneId, reason, description }) =>
      mockMilestoneApi.raiseDispute(milestoneId, reason, description),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    },
  });
}

export type { CreateMilestonePayload, SubmitMilestonePayload, SendMessagePayload, SubmitProposalPayload };
