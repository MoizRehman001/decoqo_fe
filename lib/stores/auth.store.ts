/**
 * Zustand auth store — in-memory token management.
 *
 * AUTH-05: JWT access token stored in memory (never localStorage / sessionStorage)
 * AUTH-06: Refresh token in httpOnly cookie — auto-refresh on 401
 * AUTH-07: Role-based route protection (CUSTOMER/VENDOR/ADMIN/SUPER_ADMIN)
 * AUTH-08: Logout clears token and cookie
 *
 * NOTE: The `persist` middleware is intentionally NOT used so the access token
 * is never written to any browser storage.
 *
 * NOTE: `refreshToken()` and `logout()` use a direct axios call (not the shared
 * apiClient) to avoid a circular dependency — apiClient's 401 interceptor calls
 * `refreshToken()`, so importing apiClient here would create a cycle.
 */

import { create } from 'zustand';
import axios from 'axios';
import type { AuthUser } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  /** JWT access token — lives in JS memory only, never persisted. */
  accessToken: string | null;
  /** Currently authenticated user. */
  user: AuthUser | null;
  /** Derived convenience flag. */
  isAuthenticated: boolean;
  /** True while an async auth operation (refresh / initialize) is in flight. */
  isLoading: boolean;
}

interface AuthActions {
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  initialize: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AUTH_BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:3001/api/v1';

interface RefreshPayload {
  accessToken?: string;
  user?: AuthUser;
}

interface RefreshResponse {
  data?: RefreshPayload;
  accessToken?: string;
  user?: AuthUser;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAccessToken: (token: string) => {
    set({ accessToken: token, isAuthenticated: true });
  },

  setUser: (user: AuthUser) => {
    set({ user });
  },

  logout: () => {
    axios
      .post(`${AUTH_BASE_URL}/auth/logout`, {}, { withCredentials: true })
      .catch(() => {
        // Ignore network errors on logout; local state is cleared either way.
      });

    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  refreshToken: async (): Promise<boolean> => {
    try {
      const response = await axios.post<RefreshResponse>(
        `${AUTH_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const payload: RefreshPayload | undefined =
        response.data?.data ?? response.data;
      const newToken = payload?.accessToken;
      const user = payload?.user;

      if (!newToken) return false;

      set({
        accessToken: newToken,
        isAuthenticated: true,
        ...(user ? { user } : {}),
      });

      return true;
    } catch {
      return false;
    }
  },

  initialize: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (get().isAuthenticated) return;

    set({ isLoading: true });

    try {
      const refreshed = await get().refreshToken();
      // After a successful token refresh, hydrate the user profile
      if (refreshed && !get().user) {
        try {
          const { default: apiClient } = await import('@/lib/api/client');
          const user = await apiClient.get('/auth/me') as import('@/types/api.types').AuthUser;
          set({ user });
        } catch {
          // Non-fatal — user will be hydrated on next API call
        }
      }
    } catch {
      // Silently swallow errors — the user simply starts unauthenticated.
    } finally {
      set({ isLoading: false });
    }
  },
}));
