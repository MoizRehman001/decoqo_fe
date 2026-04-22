'use client';

import { AlertTriangle, Clock } from 'lucide-react';

const MOCK_DISPUTES = [
  { id: 'dis_001', project: 'Factory Canteen — Pune', customer: 'Rahul Mehta', vendor: 'Vendor D', reason: 'Work quality below agreed standard', slaHours: 12, status: 'OPEN' },
  { id: 'dis_002', project: 'Office Interior — Delhi', customer: 'Priya Sharma', vendor: 'Vendor C', reason: 'Timeline exceeded by 3 weeks', slaHours: 36, status: 'UNDER_REVIEW' },
  { id: 'dis_003', project: 'Kitchen — Chennai', customer: 'Rahul Mehta', vendor: 'Vendor B', reason: 'Materials substituted without approval', slaHours: 48, status: 'OPEN' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'hsl(0 72% 60%)' },
  UNDER_REVIEW: { label: 'Under Review', color: 'hsl(40 45% 55%)' },
  RESOLVED: { label: 'Resolved', color: 'hsl(142 71% 45%)' },
};

export default function AdminDisputesPage() {
  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Dispute Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Active disputes requiring admin resolution.</p>
      </div>

      <div className="space-y-4">
        {MOCK_DISPUTES.map((d) => {
          const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG['OPEN']!;
          const isUrgent = d.slaHours <= 24;
          return (
            <div key={d.id} className="ivory-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${isUrgent ? 'text-red-500' : 'text-amber-500'}`} aria-hidden="true" />
                  <h3 className="font-serif font-semibold text-foreground">{d.project}</h3>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold shrink-0" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{d.reason}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>Customer: <span className="text-foreground font-medium">{d.customer}</span></span>
                <span>Vendor: <span className="text-foreground font-medium">{d.vendor}</span></span>
                <span className={`flex items-center gap-1 ${isUrgent ? 'text-red-500 font-semibold' : ''}`}>
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  SLA: {d.slaHours}h remaining
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">View Evidence</button>
                <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[hsl(0_0%_4%)] transition-colors" style={{ background: 'var(--gold-gradient)' }}>Issue Decision</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
