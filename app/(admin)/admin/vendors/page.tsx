'use client';

import { BadgeCheck, Clock, XCircle } from 'lucide-react';

const MOCK_VENDORS = [
  { id: 'usr_vend_001', name: 'Arjun Kapoor', business: 'Arjun Interiors Pvt. Ltd.', city: 'Bengaluru', status: 'APPROVED', projects: 63 },
  { id: 'usr_vend_002', name: 'Sneha Patel', business: 'DesignCraft Studio', city: 'Mumbai', status: 'PENDING', projects: 41 },
  { id: 'usr_vend_003', name: 'Ravi Kumar', business: 'Ravi Interiors', city: 'Pune', status: 'PENDING', projects: 0 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  APPROVED: { label: 'Approved', color: 'hsl(142 71% 45%)', icon: BadgeCheck },
  PENDING: { label: 'Pending KYC', color: 'hsl(40 45% 55%)', icon: Clock },
  REJECTED: { label: 'Rejected', color: 'hsl(0 72% 60%)', icon: XCircle },
};

export default function AdminVendorsPage() {
  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Vendor Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and manage vendor KYC applications.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Vendor', 'Business', 'City', 'Projects', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_VENDORS.map((v) => {
              const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG['PENDING']!;
              const Icon = cfg.icon;
              return (
                <tr key={v.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{v.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{v.business}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{v.city}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{v.projects}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 w-fit rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button type="button" className="rounded-lg border border-emerald-400/40 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">Approve</button>
                        <button type="button" className="rounded-lg border border-red-400/40 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">Reject</button>
                      </div>
                    )}
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
