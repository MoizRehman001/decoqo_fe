'use client';

import { useAuthStore } from '@/lib/stores/auth.store';

export default function VendorSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your vendor account preferences.</p>
      </div>

      <div className="neu-card-3d rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">Profile</h2>
        <div className="grid gap-3 text-sm">
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role?.toLowerCase() },
            { label: 'Status', value: user?.isVerified ? 'Verified ✓' : 'Pending' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-foreground capitalize">{row.value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
