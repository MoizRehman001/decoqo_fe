'use client';

/**
 * ChatThread — milestone-scoped real-time chat.
 * 7.1: ChatThread component (milestone-scoped)
 * 7.4: WebSocket for real-time chat delivery (polling stub in dev)
 *
 * Architecture:
 * - useChatThread polls every 8s (simulates WebSocket in dev)
 * - useSendChatMessage has optimistic update — message appears instantly
 * - Contact masking rendered inline via ChatMessage
 * - Auto-scrolls to bottom on new messages
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatThread, useSendChatMessage } from '@/lib/api/chat';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { ChatMessage as ChatMessageType } from '@/types/chat.types';

// ---------------------------------------------------------------------------
// Group consecutive messages from same sender
// ---------------------------------------------------------------------------

interface MessageGroup {
  messages: ChatMessageType[];
  senderRole: 'CUSTOMER' | 'VENDOR';
}

function groupMessages(messages: ChatMessageType[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.senderRole === msg.senderRole) {
      last.messages.push(msg);
    } else {
      groups.push({ senderRole: msg.senderRole, messages: [msg] });
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// ChatThread
// ---------------------------------------------------------------------------

interface ChatThreadProps {
  milestoneId: string;
  projectId: string;
  milestoneTitle: string;
  viewerRole: 'CUSTOMER' | 'VENDOR';
  /** When true, input is disabled (e.g. milestone is RELEASED/DISPUTED) */
  readOnly?: boolean;
}

export function ChatThread({
  milestoneId,
  projectId,
  milestoneTitle,
  viewerRole,
  readOnly = false,
}: ChatThreadProps) {
  const { user } = useAuthStore();
  const { data: thread, isLoading } = useChatThread(milestoneId);
  const sendMutation = useSendChatMessage();

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length]);

  const messageGroups = useMemo(
    () => groupMessages(thread?.messages ?? []),
    [thread?.messages],
  );

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const content = input.trim();
    setInput('');
    await sendMutation.mutateAsync({
      milestoneId,
      projectId,
      content,
      senderRole: viewerRole,
      senderName: user.name,
      senderId: user.id,
    });
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  const isEmpty = !thread || thread.messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0 rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/20 px-4 py-3 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
          <MessageSquare className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{milestoneTitle}</p>
          <p className="text-[10px] text-muted-foreground">Milestone chat</p>
        </div>
        {/* Live indicator */}
        {!readOnly && (
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0"
        style={{ maxHeight: '400px' }}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Start the conversation about this milestone
            </p>
          </div>
        ) : (
          <>
            {messageGroups.map((group, gi) => (
              <div key={gi} className="space-y-0.5 mb-3">
                {group.messages.map((msg, mi) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    viewerRole={viewerRole}
                    isLastInGroup={mi === group.messages.length - 1}
                  />
                ))}
              </div>
            ))}
            {/* Sending indicator */}
            {sendMutation.isPending && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tr-sm bg-accent/30 px-3.5 py-2.5 text-xs text-accent">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Sending…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      {!readOnly ? (
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isSending={sendMutation.isPending}
        />
      ) : (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            Chat is read-only for this milestone.
          </p>
        </div>
      )}
    </div>
  );
}
