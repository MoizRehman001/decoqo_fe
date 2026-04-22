'use client';

/**
 * Customer portal layout — sidebar + topbar shell.
 */

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    document.cookie = 'session_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  const topbarUser = user
    ? { name: user.name, email: user.email, role: user.role }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar variant="customer" onLogout={handleLogout} />
      <Topbar user={topbarUser} onLogout={handleLogout} />

      {/* Main content — offset for sidebar (lg:pl-60) and topbar (pt-16) */}
      <div className="pt-16 lg:pl-60">
        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
