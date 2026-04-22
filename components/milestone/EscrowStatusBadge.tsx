/**
 * EscrowStatusBadge — always visible on every milestone card.
 * CUST-61: Escrow status badge always visible on each milestone card
 */

import { Shield, Clock, CheckCircle, Lock, RefreshCw } from 'lucide-react';
import type { EscrowStatus } from '@/types/negotiation.types';

const CONFIG: Record<EscrowStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending Funding', color: 'hsl(0 0% 50%)', icon: Clock },
  FUNDED: { label: 'Funded', color: 'hsl(217 65% 60%)', icon: Shield },
  HELD: { label: 'Held (Dispute)', color: 'hsl(0 72% 60%)', icon: Lock },
  RELEASED: { label: 'Released', color: 'hsl(142 71% 45%)', icon: CheckCircle },
  REFUNDED: { label: 'Refunded', color: 'hsl(40 45% 55%)', icon: RefreshCw },
};

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  compact?: boolean;
}

export function EscrowStatusBadge({ status, compact = false }: EscrowStatusBadgeProps) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{ background: `${cfg.color}15`, color: cfg.color }}
      >
        <Icon className="h-2.5 w-2.5" aria-hidden="true" />
        {cfg.label}
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2"
      style={{ borderColor: `${cfg.color}30`, background: `${cfg.color}08` }}
    >
      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: cfg.color }} aria-hidden="true" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
          Escrow
        </p>
        <p className="text-xs font-semibold text-foreground">{cfg.label}</p>
      </div>
    </div>
  );
}
