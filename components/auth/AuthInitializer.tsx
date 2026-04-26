'use client';

/**
 * AuthInitializer — thin hook that fires token refresh once on mount.
 *
 * This is NOT a wrapper component. It's a hook used inside layouts.
 * We deliberately do NOT wrap children or return null — doing so in
 * Next.js 14 App Router breaks the QueryClientProvider context tree.
 *
 * Usage in layouts:
 *   useAuthInitializer();   // call at top of layout component
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';

export function useAuthInitializer(): void {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Only run if not already authenticated (e.g. just logged in)
    if (!isAuthenticated) {
      void initialize();
    }
  }, [initialize, isAuthenticated]);
}
