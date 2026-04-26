'use client';

/**
 * OTP verification screen — 6 individual digit inputs with auto-focus.
 * AUTH-04: OTP verification screen (6-digit)
 *
 * Behaviour:
 * - Shows "OTP verification pending" banner until verified
 * - Verifies against email (primary) or phone
 * - Auto-logs in the user immediately after successful verification
 * - Resend triggers OTP to both email and phone
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Mail, Phone, ShieldCheck, RefreshCw, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6;
const TIMER_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN = 60;   // 60s cooldown before resend is allowed

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getRoleRedirect(role: string): string {
  switch (role) {
    case 'CUSTOMER': return '/customer/dashboard';
    case 'VENDOR':   return '/vendor/dashboard';
    case 'ADMIN':
    case 'SUPER_ADMIN': return '/admin/dashboard';
    default: return '/';
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+91 ${digits.slice(0, 2)}****${digits.slice(-2)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OtpVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, setUser } = useAuthStore();

  const email = searchParams.get('email') ?? '';
  const phone = searchParams.get('phone') ?? '';
  const type  = searchParams.get('type') ?? 'customer';

  // Primary identifier for OTP verification — prefer email
  const identifier = email || phone;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  // OTP expiry countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      setServerError(null);
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
      }
    },
    [digits],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] ?? '';
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }, []);

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setServerError('Please enter all 6 digits.');
      return;
    }
    setIsVerifying(true);
    setServerError(null);
    try {
      const result = await authApi.verifyOtp(identifier, otp);

      // Store token + user in memory
      setAccessToken(result.accessToken);
      setUser({
        id: result.user.id,
        name: result.user.displayName,
        role: result.user.role as AuthUser['role'],
        email,
        isVerified: true,
      });

      // Set session cookies for middleware
      const cookieOpts = 'path=/; SameSite=Lax';
      document.cookie = `session_role=${result.user.role}; ${cookieOpts}`;
      document.cookie = `refresh_token=${result.accessToken}; ${cookieOpts}`;

      // router.push preserves React state; router.refresh() re-runs server
      // components so middleware picks up the new cookies without a full reload
      router.push(getRoleRedirect(result.user.role));
      router.refresh();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Invalid OTP. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      // Resend to all available channels
      const tasks: Promise<unknown>[] = [];
      if (email) tasks.push(authApi.sendOtp(email));
      if (phone) tasks.push(authApi.sendOtp(`+91${phone}`));
      await Promise.allSettled(tasks);

      setTimeLeft(TIMER_SECONDS);
      setResendCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();

      const channels = [email && 'email', phone && 'mobile'].filter(Boolean).join(' and ');
      setSuccessMessage(`A new OTP has been sent to your ${channels}.`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = digits.every((d) => d !== '');
  const canResend = resendCooldown <= 0 && !isResending;

  return (
    <div className="w-full">
      {/* ── OTP Pending Banner ─────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            OTP Verification Pending
          </p>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
            Your account has been created but is not yet active. Please verify your OTP to complete registration.
          </p>
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <ShieldCheck className="h-7 w-7 text-accent" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Verify your {type === 'vendor' ? 'business ' : ''}account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit verification code to:
        </p>

        {/* Show all channels OTP was sent to */}
        <div className="mt-2 flex flex-col items-center gap-1">
          {email && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Mail className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {maskEmail(email)}
            </span>
          )}
          {phone && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {maskPhone(phone)}
            </span>
          )}
        </div>
      </div>

      {/* ── Error / Success ─────────────────────────────────────────────────── */}
      {serverError && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
        >
          {successMessage}
        </div>
      )}

      {/* ── OTP Inputs ──────────────────────────────────────────────────────── */}
      <div
        className="mb-6 flex justify-center gap-3"
        role="group"
        aria-label="One-time password input"
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
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            className={cn(
              'h-12 w-11 rounded-lg border text-center text-lg font-semibold',
              'bg-background text-foreground',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
              digit ? 'border-accent bg-accent/5' : 'border-input',
              serverError && !digit && 'border-destructive',
            )}
          />
        ))}
      </div>

      {/* ── Timer ───────────────────────────────────────────────────────────── */}
      <div className="mb-6 text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-muted-foreground">
            Code expires in{' '}
            <span className="font-medium tabular-nums text-foreground">
              {formatTime(timeLeft)}
            </span>
          </p>
        ) : (
          <p className="text-sm text-destructive font-medium">
            Your OTP has expired. Please request a new one.
          </p>
        )}
      </div>

      {/* ── Verify Button ───────────────────────────────────────────────────── */}
      <Button
        type="button"
        onClick={handleVerify}
        disabled={isVerifying || !isComplete || timeLeft <= 0}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Verifying…
          </>
        ) : (
          'Verify & Activate Account'
        )}
      </Button>

      {/* ── Resend ──────────────────────────────────────────────────────────── */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={cn(
              'inline-flex items-center gap-1 font-medium underline underline-offset-2 transition-colors',
              !canResend
                ? 'cursor-not-allowed text-muted-foreground/50 no-underline'
                : 'text-accent hover:text-accent/80',
            )}
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
                Resending…
              </>
            ) : (
              'Resend OTP'
            )}
          </button>
        </p>
        {resendCooldown > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Resend available in {formatTime(resendCooldown)}
          </p>
        )}
      </div>

      {/* ── Dev hint ────────────────────────────────────────────────────────── */}
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
          Dev: Check the backend console for the OTP code
        </p>
      )}
    </div>
  );
}
