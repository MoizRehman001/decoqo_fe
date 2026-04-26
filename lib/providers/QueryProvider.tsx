'use client';

/**
 * QueryProvider — TanStack Query client with global error handler.
 * §16.7: Global QueryClient onError default — logs unexpected errors and shows fallback toast.
 */

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { ApiError } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Error message helper (used by global handler)
// ---------------------------------------------------------------------------

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function shouldSuppressGlobalToast(error: unknown): boolean {
  const apiError = error as ApiError | undefined;
  // Suppress toasts for errors that individual components handle themselves
  const suppressedCodes = new Set([
    'INVALID_CREDENTIALS',
    'INVALID_OTP',
    'INVALID_TOTP',
    'DUPLICATE_BID',
    'CONTACT_INFO_DETECTED',
    'IDEMPOTENCY_CONFLICT',
    'UNAUTHORIZED', // handled by 401 interceptor
  ]);
  return !!apiError?.code && suppressedCodes.has(apiError.code);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface QueryProviderProps {
  children: ReactNode;
}

function QueryProviderInner({ children }: QueryProviderProps) {
  const { toast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              const apiError = error as ApiError | undefined;
              if (apiError?.code === 'NOT_FOUND') return false;
              if (apiError?.code === 'FORBIDDEN') return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
        // §16.7: Global mutation error handler
        mutationCache: new MutationCache({
          onError: (error) => {
            if (shouldSuppressGlobalToast(error)) return;
            const message = getErrorMessage(error);
            if (process.env.NODE_ENV === 'development') {
              console.error('[QueryClient] Mutation error:', error);
            }
            toast({
              title: 'Error',
              description: message,
              variant: 'destructive',
              duration: 5000,
            });
          },
        }),
        // §16.7: Global query error handler (only for unexpected errors)
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Only show toast for background refetch failures, not initial loads
            // (initial load errors are handled by component-level error states)
            if (!query.state.data) return;
            if (shouldSuppressGlobalToast(error)) return;
            const message = getErrorMessage(error);
            if (process.env.NODE_ENV === 'development') {
              console.error('[QueryClient] Query error:', error);
            }
            toast({
              title: 'Failed to refresh data',
              description: message,
              variant: 'destructive',
              duration: 4000,
            });
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryProviderInner>{children}</QueryProviderInner>;
}
