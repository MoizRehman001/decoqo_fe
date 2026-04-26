'use client';

/**
 * Admin User Management — Sprint 8
 * 8.8: User management table (ban/suspend/reinstate)
 */

import { useState } from 'react';
import {
  Search, UserX, UserCheck, Ban, Loader2,
  ShieldAlert, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from 'boneyard-js/react';
import { useAdminUsers, useUpdateUserStatus } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import type { AdminUser, UserStatus, UserRole } from '@/types/admin.types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  ACTIVE:    { label: 'Active',    color: 'hsl(142 71% 45%)' },
  SUSPENDED: { label: 'Suspended', color: 'hsl(40 45% 55%)' },
  BANNED:    { label: 'Banned',    color: 'hsl(0 72% 60%)' },
};

const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  CUSTOMER: { label: 'Customer', color: 'hsl(217 65% 60%)' },
  VENDOR:   { label: 'Vendor',   color: 'hsl(280 60% 65%)' },
  ADMIN:    { label: 'Admin',    color: 'hsl(40 45% 55%)' },
};

// ---------------------------------------------------------------------------
// Action dialog
// ---------------------------------------------------------------------------

interface ActionDialogProps {
  user: AdminUser;
  action: 'SUSPEND' | 'BAN' | 'REINSTATE';
  onClose: () => void;
}

function ActionDialog({ user, action, onClose }: ActionDialogProps) {
  const updateMutation = useUpdateUserStatus();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const needsReason = action !== 'REINSTATE';

  const handleSubmit = async () => {
    if (needsReason && !reason.trim()) { setError('Please provide a reason.'); return; }
    setError(null);
    try {
      const status: UserStatus = action === 'SUSPEND' ? 'SUSPENDED' : action === 'BAN' ? 'BANNED' : 'ACTIVE';
      await updateMutation.mutateAsync({ userId: user.id, status, reason: reason.trim() || undefined });
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Action failed.');
    }
  };

  const config = {
    SUSPEND: { title: 'Suspend User?', desc: 'User will lose access until reinstated.', btnLabel: 'Suspend', btnClass: 'bg-amber-600 text-white hover:bg-amber-700' },
    BAN:     { title: 'Ban User?',     desc: 'User will be permanently banned from the platform.', btnLabel: 'Ban User', btnClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
    REINSTATE: { title: 'Reinstate User?', desc: 'User will regain full platform access.', btnLabel: 'Reinstate', btnClass: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  }[action];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-serif">{config.title}</DialogTitle>
        <DialogDescription>{config.desc}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="rounded-xl bg-muted/30 p-3 text-sm">
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        {needsReason && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Explain the reason for this action…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={updateMutation.isPending || (needsReason && !reason.trim())}
          className={cn('gap-2', config.btnClass)}
        >
          {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {config.btnLabel}
        </Button>
      </DialogFooter>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  const { data: result, isLoading } = useAdminUsers();
  const users: AdminUser[] = result?.data ?? (Array.isArray(result) ? result as AdminUser[] : []);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [actionTarget, setActionTarget] = useState<{ user: AdminUser; action: 'SUSPEND' | 'BAN' | 'REINSTATE' } | null>(null);

  const filtered = users.filter((u) => {
    const name = u.name ?? '';
    const email = u.email ?? '';
    const matchSearch =
      !search.trim() ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ban, suspend, or reinstate platform users.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'CUSTOMER', 'VENDOR'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                roleFilter === r ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {r === 'ALL' ? 'All Roles' : ROLE_CONFIG[r].label}
            </button>
          ))}
          {(['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                statusFilter === s ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {s === 'ALL' ? 'All Status' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Skeleton name="admin-user-management" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[700px]" aria-label="Users">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['User', 'Email', 'Role', 'Projects', 'Status', 'Last Active', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const statusCfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG['ACTIVE'];
                const roleCfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG['CUSTOMER'];
                const lastActive = user.lastActiveAt
                  ? new Date(user.lastActiveAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : '—';
                return (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-xs font-bold text-accent">
                          {(user.name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name ?? '—'}</p>
                          {user.suspensionReason && (
                            <p className="text-[10px] text-muted-foreground/60 max-w-[140px] truncate">{user.suspensionReason}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: `${roleCfg.color}15`, color: roleCfg.color }}
                      >
                        {roleCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground tabular-nums">{user.projectCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{lastActive}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {user.status === 'ACTIVE' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActionTarget({ user, action: 'SUSPEND' })}
                              className="h-7 gap-1 text-xs text-amber-600 hover:border-amber-400/40"
                            >
                              <UserX className="h-3 w-3" /> Suspend
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActionTarget({ user, action: 'BAN' })}
                              className="h-7 gap-1 text-xs text-destructive hover:border-destructive/40"
                            >
                              <Ban className="h-3 w-3" /> Ban
                            </Button>
                          </>
                        )}
                        {(user.status === 'SUSPENDED' || user.status === 'BANNED') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActionTarget({ user, action: 'REINSTATE' })}
                            className="h-7 gap-1 text-xs text-emerald-600 hover:border-emerald-400/40"
                          >
                            <UserCheck className="h-3 w-3" /> Reinstate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Skeleton>

      {/* Action dialog */}
      <Dialog open={!!actionTarget} onOpenChange={(o) => !o && setActionTarget(null)}>
        <DialogContent>
          {actionTarget && (
            <ActionDialog
              user={actionTarget.user}
              action={actionTarget.action}
              onClose={() => setActionTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
