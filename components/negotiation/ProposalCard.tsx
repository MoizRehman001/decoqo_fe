'use client';

/**
 * ProposalCard — revised quote, timeline, material level with Accept/Counter/Decline.
 * CUST-53: Vendor can submit revised proposals
 * CUST-54: Customer can Accept / Counter / Decline proposals
 */

import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatInr } from '@/lib/utils/money';
import { useRespondToProposal } from '@/lib/api/negotiation';
import type { NegotiationProposal } from '@/types/negotiation.types';

const MATERIAL_LABELS: Record<string, string> = {
  ECONOMY: 'Economy',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  LUXURY: 'Luxury',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Awaiting Response', color: 'hsl(217 65% 60%)' },
  ACCEPTED: { label: 'Accepted ✓', color: 'hsl(142 71% 45%)' },
  COUNTERED: { label: 'Countered', color: 'hsl(40 45% 55%)' },
  DECLINED: { label: 'Declined', color: 'hsl(0 72% 60%)' },
};

interface ProposalCardProps {
  proposal: NegotiationProposal;
  projectId: string;
  viewerRole: 'CUSTOMER' | 'VENDOR';
}

export function ProposalCard({ proposal, projectId, viewerRole }: ProposalCardProps) {
  const respondMutation = useRespondToProposal();
  const statusCfg = STATUS_CONFIG[proposal.status] ?? STATUS_CONFIG['PENDING']!;
  const canRespond = viewerRole === 'CUSTOMER' && proposal.status === 'PENDING';

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">
          Revised Proposal
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Quote</p>
          <p className="font-semibold text-foreground tabular-nums">{formatInr(proposal.quotePaise)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Timeline</p>
          <p className="font-semibold text-foreground">{proposal.timelineWeeks} weeks</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Material</p>
          <p className="font-semibold text-foreground">{MATERIAL_LABELS[proposal.materialLevel]}</p>
        </div>
      </div>

      {proposal.notes && (
        <p className="text-xs text-muted-foreground italic border-t border-border/40 pt-2">
          &ldquo;{proposal.notes}&rdquo;
        </p>
      )}

      {/* Actions — customer only, pending only */}
      {canRespond && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => respondMutation.mutate({ proposalId: proposal.id, action: 'ACCEPTED', projectId })}
            disabled={respondMutation.isPending}
            className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
          >
            {respondMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => respondMutation.mutate({ proposalId: proposal.id, action: 'COUNTERED', projectId })}
            disabled={respondMutation.isPending}
            className="flex-1 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Counter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => respondMutation.mutate({ proposalId: proposal.id, action: 'DECLINED', projectId })}
            disabled={respondMutation.isPending}
            className="flex-1 gap-1.5 text-xs text-destructive hover:text-destructive hover:border-destructive/40"
          >
            <XCircle className="h-3 w-3" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
