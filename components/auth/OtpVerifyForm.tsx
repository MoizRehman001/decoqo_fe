'use client';

/**
 * OTP verification screen — 6 individual digit inputs with auto-focus.
 * AUTH-04: OTP verification screen (6-digit)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Mail, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6;
const TIMER_SECONDS = 5 * 60; // 5 minutes

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
    case 'CUSTOMER':
      return '/customer/dashboard';
    case 'VENDOR':
      return '/vendor/dashboard';
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OtpVerifyForm() {
  const searchParams = useSearchParams();
  const { setAccessToken, setUser } = useAuthStore();
  const email = searchParams.get('email') ?? '';
  const type = searchParams.get('type') ?? 'customer';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Allow only digits
      const digit = value.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      setServerError(null);

      // Auto-advance to next input
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
          // Clear current
          const next = [...digits];
          next[index] = '';
          setDigits(next);
        } else if (index > 0) {
          // Move to previous
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
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i] ?? '';
    }
    setDigits(next);
    // Focus last filled or last input
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
      const { user, accessToken } = await authApi.verifyOtp(email, otp);
      setAccessToken(accessToken);
      setUser(user);
      const cookieOpts = 'path=/; SameSite=Lax';
      document.cookie = `session_role=${user.role}; ${cookieOpts}`;
      document.cookie = `refresh_token=${accessToken}; ${cookieOpts}`;
      window.location.href = getRoleRedirect(user.role);
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
    setIsResending(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      await authApi.sendOtp(email);
      setTimeLeft(TIMER_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setSuccessMessage('A new OTP has been sent to your email.');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Mail className="h-7 w-7 text-accent" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Verify your {type === 'vendor' ? 'business ' : ''}email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {email || 'your email address'}
        </p>
      </div>

      {/* Error / Success */}
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

      {/* OTP Inputs */}
      <div
        className="mb-6 flex justify-center gap-3"
        role="group"
        aria-label="One-time password input"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
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
              digit
                ? 'border-accent bg-accent/5'
                : 'border-input',
              serverError && !digit && 'border-destructive',
            )}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="mb-6 text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-muted-foreground">
            Code expires in{' '}
            <span className="font-medium tabular-nums text-foreground">
              {formatTime(timeLeft)}
            </span>
          </p>
        ) : (
          <p className="text-sm text-destructive">Your OTP has expired.</p>
        )}
      </div>

      {/* Verify Button */}
      <Button
        type="button"
        onClick={handleVerify}
        disabled={isVerifying || !isComplete}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Verifying…
          </>
        ) : (
          'Verify OTP'
        )}
      </Button>

      {/* Resend */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={timeLeft > 0 || isResending}
            className={cn(
              'inline-flex items-center gap-1 font-medium underline underline-offset-2 transition-colors',
              timeLeft > 0 || isResending
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
        {timeLeft > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Available in {formatTime(timeLeft)}
          </p>
        )}
      </div>

      {/* Dev hint */}
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-4 text-center text-xs text-muted-foreground/60">
          Dev: use <code className="rounded bg-muted px-1">123456</code> as universal OTP
        </p>
      )}
    </div>
  );
}
