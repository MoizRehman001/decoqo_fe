'use client';

/**
 * ChatMessage — individual chat bubble with masked content display.
 * 7.2: ChatMessage with masked content display
 *
 * Masking: contact info (phone/email) is replaced server-side with
 * [PHONE REMOVED] / [EMAIL REMOVED] and flagged=true.
 * We render a warning badge inline when masked=true.
 */

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types/chat.types';

// ---------------------------------------------------------------------------
// Masked content renderer
// ---------------------------------------------------------------------------

function renderMaskedContent(content: string): React.ReactNode {
  // Split on masked tokens and render them as warning badges
  const parts = content.split(/(\[PHONE REMOVED\]|\[EMAIL REMOVED\])/g);
  return parts.map((part, i) => {
    if (part === '[PHONE REMOVED]' || part === '[EMAIL REMOVED]') {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          title="Contact information was removed to protect privacy"
        >
          <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ---------------------------------------------------------------------------
// ChatMessage
// ---------------------------------------------------------------------------

interface ChatMessageProps {
  message: ChatMessageType;
  viewerRole: 'CUSTOMER' | 'VENDOR';
  /** Whether this is the last message in a consecutive group from same sender */
  isLastInGroup?: boolean;
}

export function ChatMessage({ message, viewerRole, isLastInGroup = true }: ChatMessageProps) {
  const isSelf = message.senderRole === viewerRole;
  const time = new Date(message.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={cn(
        'flex gap-2',
        isSelf ? 'flex-row-reverse' : 'flex-row',
        !isLastInGroup && 'mb-0.5',
      )}
    >
      {/* Avatar — only show for last in group */}
      <div className="shrink-0 w-7">
        {isLastInGroup && !isSelf && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent font-serif">
            {message.senderName.charAt(0)}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[72%] space-y-1',
          isSelf ? 'items-end' : 'items-start',
        )}
      >
        {/* Sender name — only for first in group from other party */}
        {isLastInGroup && !isSelf && (
          <p className="px-1 text-[10px] font-semibold text-muted-foreground">
            {message.senderName}
          </p>
        )}

        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isSelf
              ? 'rounded-tr-sm bg-accent text-accent-foreground'
              : 'rounded-tl-sm bg-card border border-border/60 text-foreground',
          )}
        >
          {message.masked
            ? renderMaskedContent(message.content)
            : message.content}
        </div>

        {/* Timestamp */}
        <p
          className={cn(
            'px-1 text-[10px] text-muted-foreground/60',
            isSelf ? 'text-right' : 'text-left',
          )}
        >
          {time}
          {message.flagged && (
            <span className="ml-1.5 text-amber-500" title="Contact info was masked">
              ⚠
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
