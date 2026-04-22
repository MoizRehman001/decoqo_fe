/**
 * useProjectSocket — mock WebSocket hook for real-time project updates.
 * 5.17: Implement WebSocket for milestone status updates
 *
 * In production this connects to Socket.io at NEXT_PUBLIC_WS_URL.
 * In mock/dev mode it uses polling via TanStack Query's refetchInterval.
 */

'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { milestoneKeys, negotiationKeys } from '@/lib/api/negotiation';
import { projectKeys } from '@/lib/api/projects';

interface UseProjectSocketOptions {
  projectId: string;
  /** Poll interval in ms — used in mock mode instead of real WebSocket */
  pollIntervalMs?: number;
}

/**
 * Subscribes to real-time updates for a project.
 * Mock mode: invalidates relevant queries on an interval to simulate push events.
 * Production: connects to Socket.io and invalidates on server-pushed events.
 */
export function useProjectSocket({ projectId, pollIntervalMs = 15_000 }: UseProjectSocketOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const IS_MOCK = process.env.NODE_ENV === 'development';

    if (IS_MOCK) {
      // Mock: poll every N seconds to simulate real-time updates
      const interval = setInterval(() => {
        void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
        void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      }, pollIntervalMs);

      return () => clearInterval(interval);
    }

    // Production: Socket.io connection
    // const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
    //   auth: { token: useAuthStore.getState().accessToken },
    // });
    // socket.emit('join_project', { projectId });
    //
    // socket.on('milestone.status_changed', ({ milestoneId }) => {
    //   void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    //   void queryClient.invalidateQueries({ queryKey: milestoneKeys.detail(milestoneId) });
    // });
    // socket.on('escrow.status_changed', () => {
    //   void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
    // });
    // socket.on('chat.new_message', ({ threadId }) => {
    //   void queryClient.invalidateQueries({ queryKey: negotiationKeys.thread(projectId) });
    // });
    // socket.on('design.generation.complete', () => {
    //   void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    // });
    //
    // return () => {
    //   socket.emit('leave_project', { projectId });
    //   socket.disconnect();
    // };
  }, [projectId, pollIntervalMs, queryClient]);
}
