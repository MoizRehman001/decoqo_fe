'use client';

import { useAuthStore } from '@/lib/stores/auth.store';

export default function CustomerSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>

      <div className="neu-card-3d rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">Profile</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{user?.name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{user?.email ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium text-foreground capitalize">{user?.role?.toLowerCase() ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Verified</span>
            <span className={`font-medium ${user?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
              {user?.isVerified ? 'Verified ✓' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
