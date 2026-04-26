'use client';

/**
 * useApiErrorToast — maps ApiError.code to human-readable messages and fires toasts.
 * §16.3: Shared error toast hook for all useMutation onError callbacks.
 *
 * Usage:
 *   const { handleError } = useApiErrorToast();
 *   useMutation({ ..., onError: handleError });
 */

import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { ApiError } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Error code → user-friendly message map
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_OTP: 'Invalid or expired OTP. Please try again.',
  INVALID_TOTP: 'Invalid MFA code. Please check your authenticator app.',
  ACCOUNT_BANNED: 'Your account has been suspended. Contact support.',
  ACCOUNT_SUSPENDED: 'Your account is suspended. Contact support.',
  PENDING_VERIFICATION: 'Please verify your account before logging in.',

  // Projects
  PROJECT_NOT_FOUND: 'Project not found.',
  PROJECT_STATE_INVALID: 'This action is not allowed in the current project state.',

  // Bidding
  DUPLICATE_BID: 'You have already submitted a bid for this project.',
  BID_ALREADY_SELECTED: 'This bid has already been selected.',
  BIDDING_EXPIRED: 'The bidding period for this project has expired.',

  // Milestones
  MILESTONE_NOT_FUNDED: 'Milestone must be funded before starting work.',
  MILESTONE_STATE_INVALID: 'This action is not allowed for the current milestone status.',
  MILESTONE_PERCENTAGE_INVALID: 'Milestone percentages must total exactly 100%.',

  // BOQ
  BOQ_STATE_INVALID: 'This action is not allowed for the current BOQ status.',
  BOQ_EMPTY: 'BOQ must have at least one item before submitting.',
  BOQ_LOCKED: 'This BOQ is locked and cannot be edited.',

  // Escrow / Payments
  MISSING_IDEMPOTENCY_KEY: 'Payment request is missing a required key. Please try again.',
  ESCROW_STATE_INVALID: 'Escrow is not in the correct state for this action.',
  PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
  ESCROW_INSUFFICIENT_FUNDS: 'Insufficient funds in escrow for this action.',

  // §16.5: Idempotency conflict — payment already in progress
  IDEMPOTENCY_CONFLICT: 'A payment for this milestone is already in progress. Please wait.',

  // Disputes
  DISPUTE_ALREADY_EXISTS: 'A dispute already exists for this milestone.',

  // Contact masking — §16.4
  CONTACT_INFO_DETECTED:
    'Your message contained contact information (phone/email) which was automatically masked to protect privacy.',

  // Generic
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'A conflict occurred. The resource may already exist.',
  INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
};

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useApiErrorToast() {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown) => {
      const apiError = error as ApiError | undefined;
      const code = apiError?.code ?? '';
      const message = ERROR_MESSAGES[code] ?? apiError?.message ?? DEFAULT_MESSAGE;

      // §16.4: Contact masking — show as info, not error
      if (code === 'CONTACT_INFO_DETECTED') {
        toast({
          title: '⚠️ Contact info masked',
          description: message,
          variant: 'default',
          duration: 6000,
        });
        return;
      }

      // §16.5: Idempotency conflict — show as warning
      if (code === 'IDEMPOTENCY_CONFLICT') {
        toast({
          title: 'Payment in progress',
          description: message,
          variant: 'default',
          duration: 5000,
        });
        return;
      }

      // §16.6: Escrow / payment errors
      if (code === 'PAYMENT_FAILED' || code === 'ESCROW_INSUFFICIENT_FUNDS') {
        toast({
          title: 'Payment error',
          description: message,
          variant: 'destructive',
          duration: 8000,
        });
        return;
      }

      // Default: destructive toast
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
        duration: 5000,
      });
    },
    [toast],
  );

  return { handleError };
}
