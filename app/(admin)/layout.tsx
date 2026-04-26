'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAuthInitializer } from '@/components/auth/AuthInitializer';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  // Restore access token from httpOnly cookie on every page load
  useAuthInitializer();

  // Redirect to admin login if not authenticated or not an admin role
  useEffect(() => {
    if (isLoading) return; // wait for token refresh to complete

    if (!isAuthenticated) {
      router.replace('/admin-login');
      return;
    }

    if (
      user &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      // Authenticated but wrong role — kick out
      logout();
      router.replace('/admin-login');
    }
  }, [isAuthenticated, isLoading, user, router, logout]);

  const handleLogout = () => {
    logout();
    document.cookie = 'session_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin-login');
  };

  // Show nothing while auth is being restored
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  const topbarUser = user
    ? { name: user.name, email: user.email ?? '', role: user.role }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar variant="admin" onLogout={handleLogout} />
      <Topbar user={topbarUser} onLogout={handleLogout} />
      <div className="pt-16 lg:pl-60">
        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
