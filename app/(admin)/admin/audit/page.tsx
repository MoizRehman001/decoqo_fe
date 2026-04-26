'use client';

/**
 * Admin Audit Log — Sprint 8
 * 8.9: Audit log viewer with search
 */

import { useState } from 'react';
import { Search, Shield, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from 'boneyard-js/react';
import { useAuditLog } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import type { AuditAction } from '@/types/admin.types';

// ---------------------------------------------------------------------------
// Action config
// ---------------------------------------------------------------------------

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string }> = {
  VENDOR_APPROVED:    { label: 'Vendor Approved',    color: 'hsl(142 71% 45%)' },
  VENDOR_REJECTED:    { label: 'Vendor Rejected',    color: 'hsl(0 72% 60%)' },
  USER_SUSPENDED:     { label: 'User Suspended',     color: 'hsl(40 45% 55%)' },
  USER_BANNED:        { label: 'User Banned',        color: 'hsl(0 72% 60%)' },
  USER_REINSTATED:    { label: 'User Reinstated',    color: 'hsl(142 71% 45%)' },
  ESCROW_FROZEN:      { label: 'Escrow Frozen',      color: 'hsl(0 72% 60%)' },
  ESCROW_UNFROZEN:    { label: 'Escrow Unfrozen',    color: 'hsl(40 45% 55%)' },
  ESCROW_RELEASED:    { label: 'Escrow Released',    color: 'hsl(142 71% 45%)' },
  DISPUTE_OPENED:     { label: 'Dispute Opened',     color: 'hsl(0 72% 60%)' },
  DISPUTE_RESOLVED:   { label: 'Dispute Resolved',   color: 'hsl(217 65% 60%)' },
  CONTACT_MASKED:     { label: 'Contact Masked',     color: 'hsl(280 60% 65%)' },
  ADMIN_LOGIN:        { label: 'Admin Login',        color: 'hsl(0 0% 50%)' },
  BOQ_OVERRIDE:       { label: 'BOQ Override',       color: 'hsl(40 45% 55%)' },
  MILESTONE_OVERRIDE: { label: 'Milestone Override', color: 'hsl(40 45% 55%)' },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data: entries, isLoading } = useAuditLog(debouncedSearch);

  // Simple debounce
  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as unknown as { _auditTimer?: ReturnType<typeof setTimeout> })._auditTimer);
    (window as unknown as { _auditTimer?: ReturnType<typeof setTimeout> })._auditTimer = setTimeout(
      () => setDebouncedSearch(v),
      300,
    );
  };

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete record of all admin and system actions.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by action, actor, or target…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats row */}
      {!isLoading && entries && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            {entries.length} entries
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            {entries.filter((e) => e.actorRole === 'ADMIN').length} admin actions
          </span>
          <span>
            {entries.filter((e) => e.actorRole === 'SYSTEM').length} system events
          </span>
        </div>
      )}

      {/* Table */}
      <Skeleton name="admin-audit-log" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[700px]" aria-label="Audit log">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Timestamp', 'Actor', 'Action', 'Target', 'IP Address'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(entries ?? []).map((entry) => {
                const cfg = ACTION_CONFIG[entry.action] ?? { label: entry.action, color: 'hsl(0 0% 50%)' };
                const date = new Date(entry.timestamp);
                return (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      <p>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-muted-foreground/60">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{entry.actor}</p>
                      <p className="text-[10px] text-muted-foreground/60 capitalize">{entry.actorRole.toLowerCase()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: `${cfg.color}15`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground max-w-[200px] truncate">{entry.target}</p>
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {Object.entries(entry.metadata)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{entry.ipAddress}</td>
                  </tr>
                );
              })}
              {(entries ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No audit entries match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Skeleton>
    </div>
  );
}
