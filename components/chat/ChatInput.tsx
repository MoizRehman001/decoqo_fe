'use client';

/**
 * ChatInput — message composer with send button and masking hint.
 * 7.3: ChatInput with send button
 */

import { useRef } from 'react';
import { Send, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isSending = false,
  disabled = false,
  placeholder = 'Type a message…',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSending && !disabled) onSend();
    }
  };

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const canSend = value.trim().length > 0 && !isSending && !disabled;

  return (
    <div className="border-t border-border bg-card/50 px-3 py-3 space-y-2">
      {/* Masking hint */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Phone numbers and emails are automatically masked for privacy</span>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Chat message"
          className={cn(
            'flex-1 resize-none overflow-hidden rounded-xl border border-input bg-background',
            'px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
            'transition-colors duration-150 min-h-[40px]',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
        <Button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          size="icon"
          aria-label="Send message"
          className={cn(
            'h-10 w-10 shrink-0 rounded-xl transition-all duration-150',
            canSend
              ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground/40 text-right">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
