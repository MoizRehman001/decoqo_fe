'use client';

/**
 * useProjectSocket — real Socket.io connection for project real-time updates.
 * §15: WebSocket / Real-Time Integration
 *
 * Connects to the NestJS Socket.io gateway at NEXT_PUBLIC_WS_URL.
 * JWT access token is passed in the socket auth handshake.
 *
 * Server events handled:
 *   design.generation.progress   → update local progress state
 *   design.generation.complete   → invalidate AI designs query
 *   milestone.status_changed     → invalidate milestone queries
 *   escrow.status_changed        → invalidate milestone + payment queries
 *   chat.new_message             → invalidate chat messages query
 *   notification.new             → show toast notification
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { milestoneKeys, negotiationKeys } from '@/lib/api/negotiation';
import { projectKeys } from '@/lib/api/projects';
import { aiDesignKeys } from '@/lib/api/bidding';
import { chatKeys } from '@/lib/api/chat';
import { paymentKeys } from '@/lib/api/payments';
import { useToast } from '@/components/ui/use-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseProjectSocketOptions {
  projectId: string;
  /** Called when AI design generation progress updates (0–100) */
  onDesignProgress?: (jobId: string, progress: number) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProjectSocket({ projectId, onDesignProgress }: UseProjectSocketOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  // Stable callback refs so socket listeners don't re-register on every render
  const onDesignProgressRef = useRef(onDesignProgress);
  onDesignProgressRef.current = onDesignProgress;

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl || !projectId) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return; // Don't connect if not authenticated

    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    // ── Connection lifecycle ───────────────────────────────────────────────

    socket.on('connect', () => {
      // §15.8: Emit join_project on connect
      socket.emit('join_project', { projectId });
    });

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Socket] Disconnected:', reason);
      }
    });

    socket.on('connect_error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Socket] Connection error:', err.message);
      }
    });

    // ── §15.3: AI Design events ────────────────────────────────────────────

    socket.on('design.generation.progress', ({ jobId, progress }: { jobId: string; progress: number }) => {
      onDesignProgressRef.current?.(jobId, progress);
    });

    socket.on('design.generation.complete', ({ jobId }: { jobId: string }) => {
      void queryClient.invalidateQueries({ queryKey: aiDesignKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    });

    // ── §15.4: Milestone events ────────────────────────────────────────────

    socket.on('milestone.status_changed', ({ milestoneId, newStatus }: { milestoneId: string; newStatus: string }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.detail(milestoneId) });
    });

    // ── §15.5: Escrow events ───────────────────────────────────────────────

    socket.on('escrow.status_changed', ({ milestoneId, escrowStatus }: { milestoneId: string; escrowStatus: string }) => {
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.escrow(milestoneId) });
    });

    // ── §15.6: Chat events ─────────────────────────────────────────────────

    socket.on('chat.new_message', ({ threadId }: { threadId: string }) => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(threadId) });
    });

    // ── §15.7: Notification events ─────────────────────────────────────────

    socket.on('notification.new', ({ type, title, body }: { type: string; title: string; body: string }) => {
      toast({
        title,
        description: body,
        duration: 6000,
      });
    });

    return socket;
  }, [projectId, queryClient, toast]);

  useEffect(() => {
    if (!projectId) return;

    const socket = connect();

    // §15.8: Cleanup — emit leave_project and disconnect
    return () => {
      if (socket) {
        socket.emit('leave_project', { projectId });
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [projectId, connect]);

  return {
    /** Manually emit a custom event (e.g. join_milestone) */
    emit: useCallback((event: string, data?: unknown) => {
      socketRef.current?.emit(event, data);
    }, []),
    /** Whether the socket is currently connected */
    isConnected: socketRef.current?.connected ?? false,
  };
}

// ---------------------------------------------------------------------------
// §15.10: useMilestoneSocket — joins a milestone room for milestone-level events
// ---------------------------------------------------------------------------

export function useMilestoneSocket({ milestoneId, projectId }: { milestoneId: string; projectId: string }) {
  const { emit } = useProjectSocket({ projectId });

  useEffect(() => {
    if (!milestoneId) return;
    emit('join_milestone', { milestoneId });
  }, [milestoneId, emit]);
}
