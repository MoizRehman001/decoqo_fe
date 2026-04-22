/**
 * TrustSignals — 5 platform trust benefits, always shown in bidding room.
 * CUST-37: Trust signals section always visible on profile card
 * CUST-08: Trust signals section (5 platform benefits, always shown)
 */

import { Shield, Lock, Eye, Scale, BadgeCheck } from 'lucide-react';

const SIGNALS = [
  {
    icon: Shield,
    title: 'Escrow Protected',
    desc: 'Your payment is held securely until you approve each milestone.',
    color: 'hsl(40 45% 55%)',
  },
  {
    icon: Lock,
    title: 'BOQ Locked',
    desc: 'Scope and pricing are frozen before work begins. No surprises.',
    color: 'hsl(217 65% 60%)',
  },
  {
    icon: Eye,
    title: 'Anonymous Bidding',
    desc: 'Vendors compete on merit. Identity revealed only after you select.',
    color: 'hsl(142 71% 45%)',
  },
  {
    icon: Scale,
    title: 'Dispute Resolution',
    desc: 'Neutral arbitration with 48-hour SLA if anything goes wrong.',
    color: 'hsl(280 60% 65%)',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Vendors',
    desc: 'Every vendor is KYC-verified, GST-registered, and background-checked.',
    color: 'hsl(0 72% 60%)',
  },
] as const;

interface TrustSignalsProps {
  compact?: boolean;
}

export function TrustSignals({ compact = false }: TrustSignalsProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {SIGNALS.map(({ icon: Icon, title, color }) => (
          <div
            key={title}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{ borderColor: `${color}30`, background: `${color}10`, color }}
          >
            <Icon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-4 w-4 text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">Decoqo Trust Guarantee</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {SIGNALS.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${color}15`, color }}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
