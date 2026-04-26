/**
 * Ratings API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/rating/rating.controller.ts
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const ratingKeys = {
  all: ['ratings'] as const,
  byProject: (projectId: string) => [...ratingKeys.all, 'project', projectId] as const,
  byVendor: (vendorUserId: string) => [...ratingKeys.all, 'vendor', vendorUserId] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Get ratings for a project.
 * GET /api/v1/projects/:id/ratings
 */
export function useProjectRatings(projectId: string) {
  return useQuery({
    queryKey: ratingKeys.byProject(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/ratings`),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

/**
 * Get vendor ratings (public).
 * GET /api/v1/vendors/:id/ratings
 */
export function useVendorRatings(vendorUserId: string) {
  return useQuery({
    queryKey: ratingKeys.byVendor(vendorUserId),
    queryFn: () => apiClient.get(`/vendors/${vendorUserId}/ratings`),
    enabled: !!vendorUserId,
    staleTime: 60_000,
  });
}

/**
 * Submit a rating after project closure.
 * POST /api/v1/projects/:id/ratings
 * Backend field: ratedUserId (the user being rated)
 */
export function useSubmitRating() {
  const queryClient = useQueryClient();
  return useMutation<
    { id: string; score: number; comment?: string; createdAt: string },
    Error,
    { projectId: string; ratedUserId: string; score: 1 | 2 | 3 | 4 | 5; comment?: string }
  >({
    mutationFn: ({ projectId, ...payload }) =>
      apiClient.post(`/projects/${projectId}/ratings`, payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: ratingKeys.byProject(projectId) });
    },
  });
}
