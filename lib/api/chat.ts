/**
 * Chat API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/chat/chat.controller.ts
 *
 * NOTE: The chat controller uses path prefix 'chat', not 'projects/:id/chat'.
 * Correct paths:
 *   GET  /api/v1/chat/projects/:id/threads
 *   GET  /api/v1/chat/threads/:threadId/messages
 *   POST /api/v1/chat/threads/:threadId/messages
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { ChatMessage, ChatThread } from '@/types/chat.types';
import type { PaginatedResult } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const chatKeys = {
  all: ['chat'] as const,
  threads: (projectId: string) => [...chatKeys.all, 'threads', projectId] as const,
  messages: (threadId: string) => [...chatKeys.all, 'messages', threadId] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * List chat threads for a project.
 * GET /api/v1/chat/projects/:id/threads
 */
export function useChatThreads(projectId: string) {
  return useQuery<ChatThread[], Error>({
    queryKey: chatKeys.threads(projectId),
    queryFn: () => apiClient.get(`/chat/projects/${projectId}/threads`),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * Get messages in a chat thread (paginated).
 * GET /api/v1/chat/threads/:threadId/messages
 * Polls every 8s until WebSocket integration replaces polling (§15).
 */
export function useChatMessages(threadId: string) {
  return useQuery<PaginatedResult<ChatMessage>, Error>({
    queryKey: chatKeys.messages(threadId),
    queryFn: () => apiClient.get(`/chat/threads/${threadId}/messages`, { params: { page: 1, limit: 50 } }),
    enabled: !!threadId,
    staleTime: 5_000,
    refetchInterval: 8_000, // Remove after WebSocket integration (task 15.6)
  });
}

/**
 * Send a message in a chat thread (contact info auto-masked by backend).
 * POST /api/v1/chat/threads/:threadId/messages
 */
export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation<ChatMessage, Error, { threadId: string; projectId: string; content: string; senderId: string; senderName: string; senderRole: 'CUSTOMER' | 'VENDOR' }>({
    mutationFn: ({ threadId, content }) =>
      apiClient.post(`/chat/threads/${threadId}/messages`, { content }),
    // Optimistic update — append message immediately for instant feedback
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(payload.threadId) });
      const previous = queryClient.getQueryData<PaginatedResult<ChatMessage>>(
        chatKeys.messages(payload.threadId),
      );

      const optimisticMsg: ChatMessage = {
        id: `optimistic_${Date.now()}`,
        milestoneId: '',
        projectId: payload.projectId,
        senderId: payload.senderId,
        senderRole: payload.senderRole,
        senderName: payload.senderName,
        content: payload.content,
        flagged: false,
        masked: false,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<PaginatedResult<ChatMessage>>(
        chatKeys.messages(payload.threadId),
        (old) => {
          if (!old) return old;
          return { ...old, data: [...old.data, optimisticMsg] };
        },
      );

      return { previous };
    },
    onError: (_err, payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(chatKeys.messages(payload.threadId), context.previous);
      }
    },
    onSettled: (_data, _err, payload) => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(payload.threadId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Re-export timeline and rating hooks from their dedicated modules
// (kept here for backward compatibility with existing component imports)
// ---------------------------------------------------------------------------

export { useProjectTimeline } from '@/lib/api/timeline';
export { useProjectRatings, useSubmitRating } from '@/lib/api/ratings';

// ---------------------------------------------------------------------------
// Project closure
// ---------------------------------------------------------------------------

import { useMutation as useClosureMutation } from '@tanstack/react-query';
import { projectKeys } from '@/lib/api/projects';
import { timelineKeys } from '@/lib/api/timeline';

export function useCloseProject() {
  const queryClient = useQueryClient();
  return useClosureMutation<{ cancelled: boolean }, Error, string>({
    mutationFn: (projectId) => apiClient.delete(`/projects/${projectId}`),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: timelineKeys.byProject(projectId) });
    },
  });
}
