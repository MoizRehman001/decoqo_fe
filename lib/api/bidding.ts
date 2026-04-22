/**
 * Bidding API — TanStack Query keys + hooks.
 * Wraps mock API; swap for real apiClient calls in production.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockBiddingApi, mockAiDesignApi } from '@/mock/mockData';
import type { Bid, AiDesign, VendorProfile, BiddingRoom, SubmitBidPayload } from '@/types/bidding.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const biddingKeys = {
  all: ['bidding'] as const,
  room: (projectId: string) => [...biddingKeys.all, 'room', projectId] as const,
  vendorProfile: (vendorId: string) => [...biddingKeys.all, 'vendor', vendorId] as const,
  myBids: (vendorId: string) => [...biddingKeys.all, 'my-bids', vendorId] as const,
};

export const aiDesignKeys = {
  all: ['ai-designs'] as const,
  byProject: (projectId: string) => [...aiDesignKeys.all, 'project', projectId] as const,
  detail: (designId: string) => [...aiDesignKeys.all, 'detail', designId] as const,
};

// ---------------------------------------------------------------------------
// Bidding Room Hooks
// ---------------------------------------------------------------------------

export function useBiddingRoom(projectId: string) {
  return useQuery<BiddingRoom, Error>({
    queryKey: biddingKeys.room(projectId),
    queryFn: () => mockBiddingApi.getBiddingRoom(projectId),
    enabled: !!projectId,
    staleTime: 15_000,
    refetchInterval: 30_000, // poll every 30s for new bids
  });
}

export function useVendorProfile(vendorId: string, revealed = false) {
  return useQuery<VendorProfile, Error>({
    queryKey: [...biddingKeys.vendorProfile(vendorId), { revealed }],
    queryFn: () =>
      revealed
        ? mockBiddingApi.getVendorProfileRevealed(vendorId)
        : mockBiddingApi.getVendorProfile(vendorId),
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}

export function useMyBids(vendorId: string) {
  return useQuery<Bid[], Error>({
    queryKey: biddingKeys.myBids(vendorId),
    queryFn: () => mockBiddingApi.getMyBids(vendorId),
    enabled: !!vendorId,
    staleTime: 30_000,
  });
}

export function useShortlistBid() {
  const queryClient = useQueryClient();
  return useMutation<Bid, Error, { bidId: string; projectId: string }>({
    mutationFn: ({ bidId }) => mockBiddingApi.shortlistBid(bidId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.room(projectId) });
    },
  });
}

export function useSelectVendor() {
  const queryClient = useQueryClient();
  return useMutation<
    { bid: Bid; project: import('@/types/project.types').Project },
    Error,
    { projectId: string; bidId: string }
  >({
    mutationFn: (payload) => mockBiddingApi.selectVendor(payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.room(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useSubmitBid() {
  const queryClient = useQueryClient();
  return useMutation<Bid, Error, SubmitBidPayload>({
    mutationFn: (payload) => mockBiddingApi.submitBid(payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.room(projectId) });
    },
  });
}

export function useWithdrawBid() {
  const queryClient = useQueryClient();
  return useMutation<Bid, Error, { bidId: string; vendorId: string }>({
    mutationFn: ({ bidId }) => mockBiddingApi.withdrawBid(bidId),
    onSuccess: (_data, { vendorId }) => {
      void queryClient.invalidateQueries({ queryKey: biddingKeys.myBids(vendorId) });
    },
  });
}

// ---------------------------------------------------------------------------
// AI Design Hooks
// ---------------------------------------------------------------------------

export function useAiDesigns(projectId: string) {
  return useQuery<AiDesign[], Error>({
    queryKey: aiDesignKeys.byProject(projectId),
    queryFn: () => mockAiDesignApi.getDesigns(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useGenerateDesigns() {
  const queryClient = useQueryClient();
  return useMutation<
    AiDesign,
    Error,
    { projectId: string; theme: string; filters: AiDesign['filters'] }
  >({
    mutationFn: ({ projectId, theme, filters }) =>
      mockAiDesignApi.generateDesigns(projectId, theme, filters),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: aiDesignKeys.byProject(projectId) });
    },
  });
}

export function usePollDesignProgress() {
  return useMutation<AiDesign, Error, string>({
    mutationFn: (designId) => mockAiDesignApi.pollGenerationProgress(designId),
  });
}

export function useSelectDesign() {
  const queryClient = useQueryClient();
  return useMutation<AiDesign, Error, { designId: string; imageUrl: string; projectId: string }>({
    mutationFn: ({ designId, imageUrl }) => mockAiDesignApi.selectDesign(designId, imageUrl),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: aiDesignKeys.byProject(projectId) });
    },
  });
}

export function useLockDesign() {
  const queryClient = useQueryClient();
  return useMutation<AiDesign, Error, { designId: string; projectId: string }>({
    mutationFn: ({ designId }) => mockAiDesignApi.lockDesign(designId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: aiDesignKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: ['projects', 'detail', projectId] });
    },
  });
}
