/**
 * Projects API module — TanStack Query keys + hooks + mock-backed API calls.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockProjectApi, mockDashboardApi } from '@/mock/mockData';
import type { CreateProjectPayload, UpdateProjectPayload } from '@/mock/mockData';
import type { Project, DashboardStats, ActivityEvent } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  byUser: (userId: string) => [...projectKeys.all, 'user', userId] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
  dashboard: (userId: string) => [...projectKeys.all, 'dashboard', userId] as const,
  activity: (userId: string) => [...projectKeys.all, 'activity', userId] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useProjects(userId: string) {
  return useQuery<Project[], Error>({
    queryKey: projectKeys.byUser(userId),
    queryFn: () => mockProjectApi.getProjects(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery<Project, Error>({
    queryKey: projectKeys.detail(id),
    queryFn: () => mockProjectApi.getProject(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useDashboardStats(userId: string) {
  return useQuery<DashboardStats, Error>({
    queryKey: projectKeys.dashboard(userId),
    queryFn: () => mockDashboardApi.getStats(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useActivityFeed(userId: string) {
  return useQuery<ActivityEvent[], Error>({
    queryKey: projectKeys.activity(userId),
    queryFn: () => mockDashboardApi.getActivity(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, CreateProjectPayload>({
    mutationFn: (data) => mockProjectApi.createProject(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function usePublishProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, string>({
    mutationFn: (id) => mockProjectApi.publishProject(id),
    onSuccess: (data) => {
      queryClient.setQueryData(projectKeys.detail(data.id), data);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { id: string; data: UpdateProjectPayload }>({
    mutationFn: ({ id, data }) => mockProjectApi.saveDraft(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(projectKeys.detail(data.id), data);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export type { CreateProjectPayload, UpdateProjectPayload };
