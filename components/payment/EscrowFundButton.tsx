'use client';

/**
 * EscrowFundButton — triggers Razorpay checkout to fund a milestone escrow.
 * 6.12: EscrowFundButton → Razorpay checkout integration
 * 6.13: Integrate Razorpay.js SDK (load script, open checkout, handle callback)
 * 6.14: Build escrow status display
 *
 * In mock mode: simulates the Razorpay flow with a dialog.
 * In production: loads Razorpay.js, opens checkout, handles payment callback.
 */

import { useState } from 'react';
import { IndianRupee, Loader2, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatInr } from '@/lib/utils/money';
import { useInitiateEscrow } from '@/lib/api/boq';
import { cn } from '@/lib/utils';
import type { EscrowStatus } from '@/types/negotiation.types';

// ---------------------------------------------------------------------------
// Escrow status badge
// ---------------------------------------------------------------------------

const ESCROW_STATUS_CONFIG: Record<
  EscrowStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Awaiting Funding',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: AlertCircle,
  },
  FUNDED: {
    label: 'Funded',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: ShieldCheck,
  },
  HELD: {
    label: 'Held (Dispute)',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    icon: Lock,
  },
  RELEASED: {
    label: 'Released',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: CheckCircle2,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'text-muted-foreground',
    bg: 'bg-muted/40',
    icon: CheckCircle2,
  },
};

interface EscrowStatusBadgeInlineProps {
  status: EscrowStatus;
}

export function EscrowStatusBadgeInline({ status }: EscrowStatusBadgeInlineProps) {
  const cfg = ESCROW_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        cfg.bg,
        cfg.color,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// EscrowFundButton
// ---------------------------------------------------------------------------

interface EscrowFundButtonProps {
  milestoneId: string;
  milestoneTitle: string;
  amountPaise: number;
  escrowStatus: EscrowStatus;
  onFunded?: () => void;
}

export function EscrowFundButton({
  milestoneId,
  milestoneTitle,
  amountPaise,
  escrowStatus,
  onFunded,
}: EscrowFundButtonProps) {
  const initiateEscrowMutation = useInitiateEscrow();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFund = escrowStatus === 'PENDING';

  const handleInitiate = async () => {
    setError(null);
    try {
      // In production: load Razorpay.js and open checkout
      // In mock: show simulated checkout dialog
      await initiateEscrowMutation.mutateAsync(milestoneId);
      setShowCheckout(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Failed to initiate payment.');
    }
  };

  const handleMockPayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Simulate Razorpay payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowCheckout(false);
        setPaymentSuccess(false);
        onFunded?.();
      }, 2000);
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!canFund) {
    return <EscrowStatusBadgeInline status={escrowStatus} />;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <EscrowStatusBadgeInline status={escrowStatus} />
        <Button
          size="sm"
          onClick={handleInitiate}
          disabled={initiateEscrowMutation.isPending}
          className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {initiateEscrowMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <IndianRupee className="h-3.5 w-3.5" />
          )}
          Fund Escrow
        </Button>
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {/* Mock Razorpay checkout dialog */}
      <Dialog open={showCheckout} onOpenChange={(o) => !o && !isProcessing && setShowCheckout(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {paymentSuccess ? 'Payment Successful!' : 'Fund Escrow'}
            </DialogTitle>
            <DialogDescription>
              {paymentSuccess
                ? 'Your payment has been processed and funds are held in escrow.'
                : 'Secure payment via Razorpay. Funds are held in escrow until milestone approval.'}
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {formatInr(amountPaise)} successfully held in escrow for{' '}
                <strong className="text-foreground">{milestoneTitle}</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Payment summary */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Milestone</span>
                  <span className="font-medium text-foreground">{milestoneTitle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-serif font-bold text-accent">{formatInr(amountPaise)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment via</span>
                  <span className="font-medium text-foreground">Razorpay</span>
                </div>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Funds are held securely in escrow. Released only after your approval.
                </p>
              </div>

              {/* Mock card input (visual only) */}
              <div className="space-y-2">
                <div className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                  4111 1111 1111 1111 (Test card)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                    12/28
                  </div>
                  <div className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                    123
                  </div>
                </div>
              </div>

              <p className="text-center text-[10px] text-muted-foreground/60">
                🔒 Mock mode — no real payment processed
              </p>
            </div>
          )}

          {!paymentSuccess && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCheckout(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMockPayment}
                disabled={isProcessing}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  <>Pay {formatInr(amountPaise)}</>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
