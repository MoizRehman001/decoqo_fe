/**
 * Timeline API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/project/project.controller.ts
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const timelineKeys = {
  all: ['timeline'] as const,
  byProject: (projectId: string) => [...timelineKeys.all, 'project', projectId] as const,
  adminByProject: (projectId: string) => [...timelineKeys.all, 'admin', 'project', projectId] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Get the trust timeline for a project.
 * GET /api/v1/projects/:id/timeline
 */
export function useProjectTimeline(projectId: string) {
  return useQuery({
    queryKey: timelineKeys.byProject(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/timeline`),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * Admin: Get the full project timeline.
 * GET /api/v1/admin/projects/:id/timeline
 */
export function useAdminProjectTimeline(projectId: string) {
  return useQuery({
    queryKey: timelineKeys.adminByProject(projectId),
    queryFn: () => apiClient.get(`/admin/projects/${projectId}/timeline`),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}
