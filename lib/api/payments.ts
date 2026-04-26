/**
 * Payments / Escrow API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/payment/payment.controller.ts
 *
 * CRITICAL: All escrow funding calls MUST include an Idempotency-Key header.
 * Generate once per payment attempt and reuse on retries.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { PaymentHistoryItem, EscrowAccount } from '@/types/boq.types';
import { milestoneKeys } from '@/lib/api/negotiation';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const paymentKeys = {
  all: ['payments'] as const,
  history: () => [...paymentKeys.all, 'history'] as const,
  escrow: (milestoneId: string) => [...paymentKeys.all, 'escrow', milestoneId] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Get payment history for the authenticated user.
 * GET /api/v1/payments/history
 */
export function usePaymentHistory() {
  return useQuery<PaymentHistoryItem[], Error>({
    queryKey: paymentKeys.history(),
    queryFn: () => apiClient.get('/payments/history'),
    staleTime: 30_000,
  });
}

/**
 * Get escrow status for a milestone.
 * GET /api/v1/payments/escrow/:milestoneId
 */
export function useEscrowStatus(milestoneId: string) {
  return useQuery<EscrowAccount, Error>({
    queryKey: paymentKeys.escrow(milestoneId),
    queryFn: () => apiClient.get(`/payments/escrow/${milestoneId}`),
    enabled: !!milestoneId,
    staleTime: 15_000,
  });
}

/**
 * Create a Razorpay payment intent to fund milestone escrow.
 * POST /api/v1/payments/escrow/fund/:milestoneId
 *
 * REQUIRED: Idempotency-Key header — generate once per payment attempt.
 * Store the key in component state and reuse on retries to prevent double-charging.
 */
export function useInitiateEscrow() {
  const queryClient = useQueryClient();
  return useMutation<
    { razorpayOrderId: string; amountPaise: number; keyId: string },
    Error,
    { milestoneId: string; projectId: string; idempotencyKey: string }
  >({
    mutationFn: ({ milestoneId, idempotencyKey }) =>
      apiClient.post(
        `/payments/escrow/fund/${milestoneId}`,
        {},
        { headers: { 'Idempotency-Key': idempotencyKey } },
      ),
    onSuccess: (_data, { projectId, milestoneId }) => {
      // Invalidate milestone list so PENDING_FUNDING status is reflected
      void queryClient.invalidateQueries({ queryKey: milestoneKeys.byProject(projectId) });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.escrow(milestoneId) });
    },
  });
}

/**
 * Generate a stable idempotency key for a payment attempt.
 * Call once per payment session and store in component state.
 * Reuse the same key on retries — do NOT regenerate on retry.
 */
export function generateIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
