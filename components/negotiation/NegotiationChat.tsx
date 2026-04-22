'use client';

/**
 * NegotiationChat — full negotiation thread with messages, proposals, and confirm flow.
 * CUST-51: Negotiation chat thread opens automatically
 * CUST-52: Contact masking
 * CUST-53: Vendor proposals
 * CUST-54: Accept/Counter/Decline
 * CUST-55: Confirm & Proceed to Milestones
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from '@/components/negotiation/MessageBubble';
import { ProposalCard } from '@/components/negotiation/ProposalCard';
import {
  useNegotiationThread,
  useSendMessage,
  useConfirmNegotiation,
} from '@/lib/api/negotiation';
import { cn } from '@/lib/utils';

interface NegotiationChatProps {
  projectId: string;
  viewerRole: 'CUSTOMER' | 'VENDOR';
}

export function NegotiationChat({ projectId, viewerRole }: NegotiationChatProps) {
  const { data: thread, isLoading } = useNegotiationThread(projectId);
  const sendMutation = useSendMessage();
  const confirmMutation = useConfirmNegotiation();

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !thread) return;
    const content = input.trim();
    setInput('');
    await sendMutation.mutateAsync({ threadId: thread.id, content, projectId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleConfirm = () => {
    if (!thread) return;
    confirmMutation.mutate({ threadId: thread.id, role: viewerRole, projectId });
  };

  const isConfirmed = viewerRole === 'CUSTOMER'
    ? thread?.customerConfirmed
    : thread?.vendorConfirmed;

  const bothConfirmed = thread?.customerConfirmed && thread?.vendorConfirmed;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
          </div>
        ))}
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="h-10 w-10 text-muted-foreground/40 mb-3" aria-hidden="true" />
        <p className="font-serif text-lg font-semibold text-foreground">No negotiation yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a vendor from the bidding room to start negotiation.
        </p>
      </div>
    );
  }

  // Interleave messages and proposals chronologically
  const allItems = [
    ...thread.messages.map((m) => ({ type: 'message' as const, data: m, time: m.createdAt })),
    ...thread.proposals.map((p) => ({ type: 'proposal' as const, data: p, time: p.createdAt })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="flex flex-col h-full">
      {/* Vendor identity banner */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-card/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-serif font-bold text-accent text-sm">
          {thread.vendorName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{thread.vendorName}</p>
          <p className="text-xs text-muted-foreground">{thread.vendorBusinessName}</p>
        </div>
        <div className="ml-auto">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              thread.status === 'CONFIRMED'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-accent/10 text-accent',
            )}
          >
            {thread.status === 'CONFIRMED' ? 'Confirmed ✓' : 'Negotiating'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {allItems.map((item) =>
          item.type === 'message' ? (
            <MessageBubble key={item.data.id} message={item.data} viewerRole={viewerRole} />
          ) : (
            <ProposalCard key={item.data.id} proposal={item.data} projectId={projectId} viewerRole={viewerRole} />
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {/* Confirm & Proceed button */}
      {!bothConfirmed && (
        <div className="border-t border-border px-4 py-3 bg-card/30">
          <Button
            onClick={handleConfirm}
            disabled={isConfirmed ?? confirmMutation.isPending}
            className={cn(
              'w-full gap-2 text-sm',
              isConfirmed
                ? 'bg-emerald-600/20 text-emerald-600 cursor-not-allowed'
                : 'bg-accent text-accent-foreground hover:bg-accent/90',
            )}
          >
            {confirmMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Confirming…</>
            ) : isConfirmed ? (
              <><CheckCircle2 className="h-4 w-4" /> You confirmed — waiting for other party</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" /> Confirm &amp; Proceed to Milestones</>
            )}
          </Button>
        </div>
      )}

      {/* Input */}
      {!bothConfirmed && (
        <div className="border-t border-border p-3 flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (contact info will be masked)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            size="icon"
            className="h-10 w-10 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            aria-label="Send message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
