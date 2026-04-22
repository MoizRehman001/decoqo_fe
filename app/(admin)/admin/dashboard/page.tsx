'use client';

import { Shield, Wallet, AlertTriangle, Users } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';

const STATS = [
  { label: 'Total Escrow Value', value: '₹180Cr+', icon: Wallet, color: 'hsl(40 45% 55%)', trend: '+12%' },
  { label: 'Open Disputes', value: '3', icon: AlertTriangle, color: 'hsl(0 72% 60%)', trend: '-2' },
  { label: 'Pending KYC', value: '7', icon: Shield, color: 'hsl(217 65% 60%)', trend: '+3' },
  { label: 'Active Users', value: '2,400+', icon: Users, color: 'hsl(142 71% 45%)', trend: '+8%' },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome, {user?.name ?? 'Admin'}. Platform overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="ivory-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{s.trend}</span>
            </div>
            <div className="font-serif text-2xl font-bold text-foreground">{s.value}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="neu-card-3d rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Recent Disputes</h2>
          <div className="space-y-3">
            {['Factory Canteen — Pune', 'Office Interior — Delhi', 'Kitchen — Chennai'].map((title, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-sm text-foreground flex-1 truncate">{title}</span>
                <span className="text-xs text-muted-foreground shrink-0">SLA: {24 - i * 6}h</span>
              </div>
            ))}
          </div>
        </div>
        <div className="neu-card-3d rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Pending KYC</h2>
          <div className="space-y-3">
            {['Sneha Patel — Mumbai', 'Ravi Kumar — Pune', 'Meera Nair — Chennai'].map((name, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-sm text-foreground flex-1">{name}</span>
                <span className="text-xs text-muted-foreground shrink-0">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
