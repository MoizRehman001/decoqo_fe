'use client';

/**
 * Admin Dashboard — Sprint 8
 * 8.1: Admin dashboard (escrow value, dispute count, KYC queue)
 * All data from adminMockData.ts — no API calls.
 */

import Link from 'next/link';
import {
  Wallet, AlertTriangle, Shield, Users,
  FolderOpen, Clock, ArrowRight, TrendingUp,
} from 'lucide-react';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { useAdminStats, useAdminDisputes, useKycQueue, useEscrowMonitor } from '@/lib/api/admin';
import { formatInrCompact, formatInr } from '@/lib/utils/money';
import { Skeleton } from 'boneyard-js/react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// SLA badge
// ---------------------------------------------------------------------------

function SlaBadge({ deadline }: { deadline: string }) {
  const hoursLeft = Math.max(
    0,
    Math.floor((new Date(deadline).getTime() - Date.now()) / 3_600_000),
  );
  const isUrgent = hoursLeft <= 24;
  const isOverdue = hoursLeft === 0;

  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-bold',
        isOverdue && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
        isUrgent && !isOverdue && 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
        !isUrgent && 'bg-muted text-muted-foreground',
      )}
    >
      {isOverdue ? 'OVERDUE' : `${hoursLeft}h SLA`}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

function AdminDashboardFixture() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: disputes } = useAdminDisputes();
  const { data: kycQueue } = useKycQueue();
  const { data: escrow } = useEscrowMonitor();

  const openDisputes = disputes?.filter((d) => d.status !== 'DECIDED' && d.status !== 'CLOSED') ?? [];
  const pendingKyc = kycQueue?.filter((k) => k.status === 'PENDING') ?? [];
  const activeEscrow = escrow?.filter((e) => e.status === 'FUNDED' || e.status === 'HELD') ?? [];
  const totalActiveEscrow = activeEscrow.reduce((s, e) => s + e.amountPaise, 0);

  return (
    <div className="space-y-8 animate-page-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats grid */}
      <Skeleton name="admin-dashboard" loading={statsLoading} animate="shimmer" transition={300} fixture={<AdminDashboardFixture />}>
        {stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStatCard
              label="Active Escrow"
              value={formatInrCompact(totalActiveEscrow || stats.activeEscrowPaise)}
              trend={stats.escrowTrend}
              icon={Wallet}
              color="hsl(40 45% 55%)"
              description="Funds under management"
            />
            <AdminStatCard
              label="Open Disputes"
              value={String(openDisputes.length || stats.openDisputeCount)}
              trend={stats.disputeTrend}
              trendLabel=""
              icon={AlertTriangle}
              color="hsl(0 72% 60%)"
              description="Requiring resolution"
            />
            <AdminStatCard
              label="Pending KYC"
              value={String(pendingKyc.length || stats.pendingKycCount)}
              trend={stats.kycTrend}
              trendLabel=""
              icon={Shield}
              color="hsl(217 65% 60%)"
              description="Vendor applications"
            />
            <AdminStatCard
              label="Active Users"
              value={stats.activeUserCount.toLocaleString('en-IN')}
              trend={stats.userTrend}
              icon={Users}
              color="hsl(142 71% 45%)"
              description={`${stats.activeProjectCount} active projects`}
            />
          </div>
        ) : null}
      </Skeleton>

      {/* Two-column content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dispute queue */}
        <div className="neu-card-3d rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">Dispute Queue</h2>
            <Link
              href="/admin/disputes"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {openDisputes.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                href={`/admin/disputes/${d.projectId}/evidence`}
                className="flex items-start gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/20 transition-colors"
              >
                <AlertTriangle
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    new Date(d.slaDeadline).getTime() - Date.now() < 24 * 3_600_000
                      ? 'text-red-500'
                      : 'text-amber-500',
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.projectTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.reason.replace(/_/g, ' ')}</p>
                </div>
                <SlaBadge deadline={d.slaDeadline} />
              </Link>
            ))}
            {openDisputes.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No open disputes</p>
            )}
          </div>
        </div>

        {/* KYC queue */}
        <div className="neu-card-3d rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">KYC Queue</h2>
            <Link
              href="/admin/vendors"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingKyc.slice(0, 4).map((k) => {
              const daysAgo = Math.floor(
                (Date.now() - new Date(k.submittedAt).getTime()) / 86_400_000,
              );
              return (
                <div
                  key={k.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif font-bold text-accent text-sm">
                    {k.vendorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{k.vendorName}</p>
                    <p className="text-xs text-muted-foreground">{k.businessName} · {k.city}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    Day {daysAgo + 1}
                  </div>
                </div>
              );
            })}
            {pendingKyc.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No pending KYC</p>
            )}
          </div>
        </div>

        {/* Escrow summary */}
        <div className="neu-card-3d rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">Escrow Monitor</h2>
            <Link
              href="/admin/escrow"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {(['FUNDED', 'HELD', 'FROZEN'] as const).map((status) => {
              const entries = escrow?.filter((e) => e.status === status) ?? [];
              const total = entries.reduce((s, e) => s + e.amountPaise, 0);
              const colors: Record<string, string> = {
                FUNDED: 'hsl(217 65% 60%)',
                HELD: 'hsl(40 45% 55%)',
                FROZEN: 'hsl(0 72% 60%)',
              };
              return (
                <div key={status} className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: colors[status] }} />
                    <span className="text-sm text-muted-foreground capitalize">{status.toLowerCase()}</span>
                    <span className="text-xs text-muted-foreground/60">({entries.length})</span>
                  </div>
                  <span className="font-serif text-sm font-bold tabular-nums text-foreground">
                    {total > 0 ? formatInr(total) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="neu-card-3d rounded-2xl p-5">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Dispute Queue', href: '/admin/disputes', icon: AlertTriangle, color: 'hsl(0 72% 60%)' },
              { label: 'KYC Review', href: '/admin/vendors', icon: Shield, color: 'hsl(217 65% 60%)' },
              { label: 'Escrow Monitor', href: '/admin/escrow', icon: Wallet, color: 'hsl(40 45% 55%)' },
              { label: 'User Management', href: '/admin/users', icon: Users, color: 'hsl(142 71% 45%)' },
              { label: 'Audit Log', href: '/admin/audit', icon: FolderOpen, color: 'hsl(280 60% 65%)' },
              { label: 'All Projects', href: '/admin/projects', icon: TrendingUp, color: 'hsl(40 45% 55%)' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-xl border border-border/60 p-3 hover:bg-muted/20 hover:border-accent/30 transition-all"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
