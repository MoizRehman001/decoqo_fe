/**
 * Projects API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/project/project.controller.ts
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { Project, Room, DashboardStats, ActivityEvent } from '@/types/project.types';
import type { PaginatedResult } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Request payload types (matching backend DTOs)
// ---------------------------------------------------------------------------

export interface CreateProjectPayload {
  title: string;
  city: string;
  pincode?: string;
  projectType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'OFFICE';
  spaceType?: string;
  description?: string;
  notes?: string;
}

export interface UpdateProjectPayload {
  title?: string;
  city?: string;
  pincode?: string;
  spaceType?: string;
  description?: string;
  notes?: string;
}

export interface AddRoomPayload {
  name: string;
  unit?: 'ft' | 'm' | 'cm';
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  notes?: string;
}

export interface SetBudgetPayload {
  budgetMin: number;
  budgetMax: number;
  budgetFlexibility?: 'STRICT' | 'FLEXIBLE_10' | 'FLEXIBLE_15';
  timelineWeeks?: number;
  priorityMode?: 'BUDGET_FIRST' | 'BALANCED' | 'DESIGN_FIRST';
}

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
  timeline: (id: string) => [...projectKeys.all, 'timeline', id] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** List the authenticated customer's projects. GET /api/v1/projects */
export function useProjects() {
  return useQuery<PaginatedResult<Project>, Error>({
    queryKey: projectKeys.lists(),
    queryFn: () => apiClient.get('/projects'),
    staleTime: 30_000,
  });
}

/** Get a single project by ID. GET /api/v1/projects/:id */
export function useProject(id: string) {
  return useQuery<Project, Error>({
    queryKey: projectKeys.detail(id),
    queryFn: () => apiClient.get(`/projects/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/** Get the trust timeline for a project. GET /api/v1/projects/:id/timeline */
export function useProjectTimeline(projectId: string) {
  return useQuery({
    queryKey: projectKeys.timeline(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/timeline`),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/** Create a new project. POST /api/v1/projects */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, CreateProjectPayload>({
    mutationFn: (data) => apiClient.post('/projects', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

/** Update a DRAFT project. PATCH /api/v1/projects/:id */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { id: string; data: UpdateProjectPayload }>({
    mutationFn: ({ id, data }) => apiClient.patch(`/projects/${id}`, data),
    onSuccess: (data) => {
      queryClient.setQueryData(projectKeys.detail(data.id), data);
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/** Alias for useUpdateProject — used by the wizard draft-save flow. */
export function useSaveDraft() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { id: string; data: UpdateProjectPayload }>({
    mutationFn: ({ id, data }) => apiClient.patch(`/projects/${id}`, data),
    onSuccess: (data) => {
      queryClient.setQueryData(projectKeys.detail(data.id), data);
    },
  });
}

/** Publish a project for bidding. POST /api/v1/projects/:id/publish */
export function usePublishProject() {
  const queryClient = useQueryClient();
  return useMutation<{ published: boolean; status: string }, Error, string>({
    mutationFn: (id) => apiClient.post(`/projects/${id}/publish`),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/** Cancel a DRAFT project. DELETE /api/v1/projects/:id */
export function useCancelProject() {
  const queryClient = useQueryClient();
  return useMutation<{ cancelled: boolean }, Error, string>({
    mutationFn: (id) => apiClient.delete(`/projects/${id}`),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/** Add a room to a project. POST /api/v1/projects/:id/rooms */
export function useAddRoom() {
  const queryClient = useQueryClient();
  return useMutation<Room, Error, { projectId: string; data: AddRoomPayload }>({
    mutationFn: ({ projectId, data }) => apiClient.post(`/projects/${projectId}/rooms`, data),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

/** Update a room. PATCH /api/v1/projects/:id/rooms/:roomId */
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation<Room, Error, { projectId: string; roomId: string; data: AddRoomPayload }>({
    mutationFn: ({ projectId, roomId, data }) =>
      apiClient.patch(`/projects/${projectId}/rooms/${roomId}`, data),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

/** Remove a room. DELETE /api/v1/projects/:id/rooms/:roomId */
export function useRemoveRoom() {
  const queryClient = useQueryClient();
  return useMutation<{ deleted: boolean }, Error, { projectId: string; roomId: string }>({
    mutationFn: ({ projectId, roomId }) =>
      apiClient.delete(`/projects/${projectId}/rooms/${roomId}`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

/** Set budget and timeline. POST /api/v1/projects/:id/budget */
export function useSetBudget() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { projectId: string; data: SetBudgetPayload }>({
    mutationFn: ({ projectId, data }) => apiClient.post(`/projects/${projectId}/budget`, data),
    onSuccess: (data) => {
      queryClient.setQueryData(projectKeys.detail(data.id), data);
    },
  });
}

// ---------------------------------------------------------------------------
// Dashboard stats — derived client-side from the projects list
// (No dedicated /dashboard/stats endpoint exists on the backend)
// ---------------------------------------------------------------------------

export function useDashboardStats() {
  const { data: projectsResult } = useProjects();
  const projects = projectsResult?.data ?? [];

  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeBids: projects.filter((p) => p.status === 'BIDDING_OPEN').length,
    pendingApprovals: projects.filter((p) => p.status === 'VENDOR_SELECTED').length,
    totalSpent: projects
      .filter((p) => p.status === 'COMPLETED')
      .reduce((s, p) => s + (p.budgetMax ?? 0), 0),
    projectsTrend: 0,
    bidsTrend: 0,
    approvalsTrend: 0,
    spentTrend: 0,
  };

  return { data: stats, isLoading: false };
}

export type { CreateProjectPayload as CreateProjectPayloadType, UpdateProjectPayload as UpdateProjectPayloadType };
