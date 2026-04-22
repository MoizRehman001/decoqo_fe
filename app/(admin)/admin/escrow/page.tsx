'use client';

import { Wallet, Lock, Unlock } from 'lucide-react';
import { formatInr } from '@/lib/utils/money';

const MOCK_ESCROW = [
  { id: 'esc_001', project: '3BHK Full Home — Koramangala', amount: 1850000 * 100, status: 'HELD', vendor: 'Vendor A' },
  { id: 'esc_002', project: 'Modular Kitchen — Bandra', amount: 550000 * 100, status: 'FUNDED', vendor: 'Vendor B' },
  { id: 'esc_003', project: 'Office Interior — Cyber City', amount: 3200000 * 100, status: 'HELD', vendor: 'Vendor C' },
  { id: 'esc_004', project: 'Master Bedroom — Jubilee Hills', amount: 420000 * 100, status: 'RELEASED', vendor: 'Vendor D' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  FUNDED: { label: 'Funded', color: 'hsl(217 65% 60%)' },
  HELD: { label: 'Held', color: 'hsl(40 45% 55%)' },
  RELEASED: { label: 'Released', color: 'hsl(142 71% 45%)' },
  FROZEN: { label: 'Frozen', color: 'hsl(0 72% 60%)' },
};

export default function AdminEscrowPage() {
  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Escrow Monitor</h1>
        <p className="mt-1 text-sm text-muted-foreground">All escrow accounts across active projects.</p>
      </div>

      <div className="ivory-card rounded-2xl p-4 flex items-center gap-3">
        <Wallet className="h-5 w-5 text-accent" aria-hidden="true" />
        <div>
          <p className="text-xs text-muted-foreground">Total Escrow Under Management</p>
          <p className="font-serif text-xl font-bold text-foreground">₹180Cr+</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Project', 'Vendor', 'Amount', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_ESCROW.map((row) => {
              const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['HELD']!;
              return (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{row.project}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.vendor}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground tabular-nums">{formatInr(row.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-red-400 hover:text-red-500 transition-colors">
                        <Lock className="h-3 w-3" aria-hidden="true" /> Freeze
                      </button>
                      <button type="button" className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-emerald-400 hover:text-emerald-500 transition-colors">
                        <Unlock className="h-3 w-3" aria-hidden="true" /> Release
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
