/**
 * MessageBubble — customer vs vendor styling with contact masking indicator.
 * CUST-52: Messages with contact info show [PHONE REMOVED] / [EMAIL REMOVED] with warning badge
 */

import { MaskedMessageWarning } from '@/components/negotiation/MaskedMessageWarning';
import type { NegotiationMessage } from '@/types/negotiation.types';

interface MessageBubbleProps {
  message: NegotiationMessage;
  /** The current user's role — determines which side the bubble appears on */
  viewerRole: 'CUSTOMER' | 'VENDOR';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function MessageBubble({ message, viewerRole }: MessageBubbleProps) {
  const isOwn = message.senderRole === viewerRole;

  return (
    <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      {/* Role label */}
      <span className="text-[10px] font-medium text-muted-foreground px-1">
        {message.senderRole === 'CUSTOMER' ? 'You (Customer)' : 'Vendor'}
      </span>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'rounded-br-sm bg-accent text-accent-foreground'
            : 'rounded-bl-sm bg-card border border-border text-foreground'
        }`}
      >
        {message.content}
      </div>

      {/* Masked warning */}
      {message.flagged && (
        <MaskedMessageWarning />
      )}

      {/* Timestamp */}
      <span className="text-[10px] text-muted-foreground px-1">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
}
