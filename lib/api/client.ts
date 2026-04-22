import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Minimal interface for the auth store slice consumed by this client.
 * The real store is created in task 1.12 (lib/stores/auth.store.ts).
 * Using a lazy import inside interceptors avoids circular dependency issues
 * and ensures the module is only resolved at runtime (safe for SSR).
 */
interface AuthStoreState {
  accessToken: string | null;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
}

/** Lazily resolve the auth store — returns null in SSR or before the store is initialised. */
function getAuthStore(): AuthStoreState | null {
  if (typeof window === 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require('@/lib/stores/auth.store') as {
      useAuthStore: { getState: () => AuthStoreState };
    };
    return useAuthStore.getState();
  } catch {
    // Store module not yet available (e.g. during early bootstrap)
    return null;
  }
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  withCredentials: true, // sends httpOnly refresh-token cookie
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token when available
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const store = getAuthStore();
  const token = store?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — unwrap data envelope + handle 401 refresh flow
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  // Success: unwrap the backend's `{ data: { data: ... } }` envelope
  (response) => response.data?.data ?? response.data,

  // Error: attempt token refresh on 401, otherwise reject with the API error
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const store = getAuthStore();

      if (store) {
        const refreshed = await store.refreshToken();

        if (refreshed) {
          // Retry the original request with the new access token
          return apiClient(error.config!);
        }

        // Refresh failed — clear auth state and redirect to login
        store.logout();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Reject with the structured API error payload when available
    return Promise.reject(
      (error.response?.data as { error?: unknown } | undefined)?.error ?? error,
    );
  },
);

export default apiClient;
