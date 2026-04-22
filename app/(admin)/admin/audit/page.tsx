'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const MOCK_AUDIT = [
  { id: 'a1', actor: 'admin@decoqo.com', action: 'VENDOR_APPROVED', target: 'Arjun Kapoor', timestamp: '2025-01-22T14:30:00Z', ip: '192.168.1.1' },
  { id: 'a2', actor: 'system', action: 'ESCROW_RELEASED', target: 'proj_004 · Milestone 3', timestamp: '2025-01-21T11:00:00Z', ip: 'system' },
  { id: 'a3', actor: 'admin@decoqo.com', action: 'DISPUTE_RESOLVED', target: 'dis_001 · Full Release', timestamp: '2025-01-20T16:45:00Z', ip: '192.168.1.1' },
  { id: 'a4', actor: 'system', action: 'CONTACT_MASKED', target: 'chat_thread_007', timestamp: '2025-01-19T09:15:00Z', ip: 'system' },
  { id: 'a5', actor: 'admin@decoqo.com', action: 'USER_SUSPENDED', target: 'designcraft@example.com', timestamp: '2025-01-18T13:00:00Z', ip: '192.168.1.1' },
];

const ACTION_COLORS: Record<string, string> = {
  VENDOR_APPROVED: 'hsl(142 71% 45%)',
  ESCROW_RELEASED: 'hsl(40 45% 55%)',
  DISPUTE_RESOLVED: 'hsl(217 65% 60%)',
  CONTACT_MASKED: 'hsl(280 60% 65%)',
  USER_SUSPENDED: 'hsl(0 72% 60%)',
};

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_AUDIT.filter(
    (e) =>
      !search.trim() ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.target.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">Complete record of all admin and system actions.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Search by action, actor, or target…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Timestamp', 'Actor', 'Action', 'Target', 'IP'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const color = ACTION_COLORS[e.action] ?? 'hsl(0 0% 50%)';
              return (
                <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{e.actor}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${color}15`, color }}>
                      {e.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{e.target}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{e.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
