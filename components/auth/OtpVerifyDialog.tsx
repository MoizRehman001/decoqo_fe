'use client';

/**
 * OtpVerifyDialog — reusable inline OTP verification modal.
 *
 * Usage:
 *   <OtpVerifyDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     identifier="+919876543210"
 *     channel="SMS"
 *     onVerified={() => setPhoneVerified(true)}
 *   />
 *
 * Design decisions:
 * - Sends OTP automatically when dialog opens (no extra click needed)
 * - 6 individual digit inputs with auto-advance and paste support
 * - Resend available after 60s cooldown
 * - Calls onVerified() on success — parent decides what to do next
 * - Does NOT navigate — purely a verification primitive
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, ShieldCheck, Mail, Phone } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OtpVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The identifier to verify — email or +91XXXXXXXXXX */
  identifier: string;
  /** Channel to use for sending OTP */
  channel: 'EMAIL' | 'SMS';
  /**
   * Called when OTP is successfully verified.
   * Receives the verifiedToken — a short-lived proof token to pass during registration.
   */
  onVerified: (verifiedToken: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function maskIdentifier(identifier: string): string {
  if (identifier.includes('@')) {
    const [local, domain] = identifier.split('@');
    return `${local?.slice(0, 2)}${'*'.repeat(Math.max((local?.length ?? 3) - 2, 3))}@${domain}`;
  }
  const digits = identifier.replace(/\D/g, '');
  return `+91 ${digits.slice(2, 4)}****${digits.slice(-2)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OtpVerifyDialog({
  open,
  onOpenChange,
  identifier,
  channel,
  onVerified,
}: OtpVerifyDialogProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Send OTP automatically when dialog opens ───────────────────────────────
  useEffect(() => {
    if (!open || !identifier) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
    setOtpSent(false);
    void sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, identifier]);

  // ── Focus first input after OTP is sent ───────────────────────────────────
  useEffect(() => {
    if (otpSent) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [otpSent]);

  // ── Cooldown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    if (!identifier) return;
    setIsSending(true);
    setError(null);
    try {
      await authApi.sendOtp(identifier);
      setOtpSent(true);
      startCooldown();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ── Digit input handlers ───────────────────────────────────────────────────
  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      setError(null);
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[index]) {
          const next = [...digits];
          next[index] = '';
          setDigits(next);
        } else if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (e.key === 'Enter') {
        void handleVerify();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [digits],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] ?? '';
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }, []);

  // ── Verify ─────────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      // Use verify-identifier — works WITHOUT a user account existing yet
      const { verifiedToken } = await authApi.verifyIdentifier(identifier, otp);
      onVerified(verifiedToken);
      onOpenChange(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? 'Invalid OTP. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const isComplete = digits.every((d) => d !== '');
  const ChannelIcon = channel === 'EMAIL' ? Mail : Phone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <ChannelIcon className="h-6 w-6 text-accent" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center">
            Verify your {channel === 'EMAIL' ? 'email' : 'mobile number'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSending && !otpSent ? (
              'Sending verification code…'
            ) : (
              <>
                We sent a 6-digit code to{' '}
                <span className="font-medium text-foreground">
                  {maskIdentifier(identifier)}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {/* OTP inputs */}
        <div
          className="flex justify-center gap-2 py-2"
          role="group"
          aria-label="One-time password"
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={isSending && !otpSent}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
              className={cn(
                'h-11 w-10 rounded-lg border text-center text-lg font-semibold',
                'bg-background text-foreground transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-40',
                digit ? 'border-accent bg-accent/5' : 'border-input',
                error && !digit && 'border-destructive',
              )}
            />
          ))}
        </div>

        {/* Verify button */}
        <Button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || !isComplete || (isSending && !otpSent)}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isVerifying ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Verifying…</>
          ) : (
            <><ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />Verify</>
          )}
        </Button>

        {/* Resend */}
        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive it?{' '}
          {cooldown > 0 ? (
            <span className="tabular-nums text-muted-foreground/60">
              Resend in {formatTime(cooldown)}
            </span>
          ) : (
            <button
              type="button"
              onClick={sendOtp}
              disabled={isSending}
              className="inline-flex items-center gap-1 font-medium text-accent underline underline-offset-2 hover:text-accent/80 disabled:opacity-50"
            >
              {isSending ? (
                <><RefreshCw className="h-3 w-3 animate-spin" />Sending…</>
              ) : (
                'Resend OTP'
              )}
            </button>
          )}
        </div>

        {/* Dev hint */}
        {process.env.NODE_ENV === 'development' && (
          <p className="rounded-md bg-muted/40 px-3 py-1.5 text-center text-xs text-muted-foreground">
            Dev: Check backend console for OTP
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
