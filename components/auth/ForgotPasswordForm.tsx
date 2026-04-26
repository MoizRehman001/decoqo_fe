'use client';

/**
 * Forgot Password flow — 3 steps:
 *   Step 1: Enter email / phone → send OTP
 *   Step 2: Enter OTP → verify identity
 *   Step 3: Enter new password → reset
 *
 * Uses existing /auth/otp/send and /auth/otp/verify endpoints.
 * Password reset is handled by /auth/reset-password (added to backend).
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import apiClient from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const identifierSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or phone number is required')
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /^[6-9]\d{9}$/.test(val);
        return isEmail || isPhone;
      },
      { message: 'Please enter a valid email address or 10-digit mobile number' },
    ),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type IdentifierForm = z.infer<typeof identifierSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type NewPasswordForm = z.infer<typeof newPasswordSchema>;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i + 1 === current ? 'w-8 bg-accent' : i + 1 < current ? 'w-4 bg-accent/40' : 'w-4 bg-muted',
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // ── Step 1 form ────────────────────────────────────────────────────────────
  const step1 = useForm<IdentifierForm>({
    resolver: zodResolver(identifierSchema),
    defaultValues: { identifier: '' },
  });

  // ── Step 2 form ────────────────────────────────────────────────────────────
  const step2 = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // ── Step 3 form ────────────────────────────────────────────────────────────
  const step3 = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  const onStep1Submit = async (data: IdentifierForm) => {
    setServerError(null);
    try {
      // Normalise phone — prepend +91 if bare 10-digit
      const raw = data.identifier.trim();
      const normalised = /^[6-9]\d{9}$/.test(raw) ? `+91${raw}` : raw;
      await authApi.sendOtp(normalised);
      setIdentifier(normalised);
      setStep(2);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Failed to send OTP. Please try again.');
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const onStep2Submit = async (data: OtpForm) => {
    setServerError(null);
    try {
      // We call a dedicated verify-for-reset endpoint that doesn't activate the account
      // but returns a reset token. For now we use the existing verifyOtp and store the
      // identifier to use in step 3.
      await apiClient.post('/auth/otp/verify-reset', { identifier, otp: data.otp });
      setStep(3);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Invalid OTP. Please try again.');
    }
  };

  // ── Step 3: Reset Password ─────────────────────────────────────────────────
  const onStep3Submit = async (data: NewPasswordForm) => {
    setServerError(null);
    try {
      await apiClient.post('/auth/reset-password', {
        identifier,
        newPassword: data.password,
      });
      setIsComplete(true);
      setSuccessMessage('Your password has been reset successfully.');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Failed to reset password. Please try again.');
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await authApi.sendOtp(identifier);
      setSuccessMessage('A new OTP has been sent.');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Failed to resend OTP.');
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Password reset!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your password has been updated successfully.
        </p>
        <Button asChild className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/login">Sign in with new password</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Back link */}
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to sign in
      </Link>

      <StepIndicator current={step} total={3} />

      {/* ── Step 1 ─────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Mail className="h-7 w-7 text-accent" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Forgot password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your registered email or mobile number and we&apos;ll send you a verification code.
            </p>
          </div>

          {serverError && (
            <div role="alert" className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form onSubmit={step1.handleSubmit(onStep1Submit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-foreground">
                Email or Mobile Number <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="priya@example.com or 9876543210"
                aria-invalid={!!step1.formState.errors.identifier}
                {...step1.register('identifier')}
              />
              <FieldError message={step1.formState.errors.identifier?.message} />
            </div>

            <Button
              type="submit"
              disabled={step1.formState.isSubmitting}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {step1.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Sending OTP…</>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>
        </>
      )}

      {/* ── Step 2 ─────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <ShieldCheck className="h-7 w-7 text-accent" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Enter verification code</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-foreground">{identifier}</span>
            </p>
          </div>

          {serverError && (
            <div role="alert" className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}
          {successMessage && (
            <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={step2.handleSubmit(onStep2Submit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-foreground">
                Verification Code <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                aria-invalid={!!step2.formState.errors.otp}
                className="text-center text-xl font-semibold tracking-widest"
                {...step2.register('otp')}
              />
              <FieldError message={step2.formState.errors.otp?.message} />
            </div>

            <Button
              type="submit"
              disabled={step2.formState.isSubmitting}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {step2.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Verifying…</>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Didn&apos;t receive it?{' '}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
            >
              Resend OTP
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
              Dev: Check the backend console for the OTP code
            </p>
          )}
        </>
      )}

      {/* ── Step 3 ─────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <KeyRound className="h-7 w-7 text-accent" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Set new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a strong password for your account.
            </p>
          </div>

          {serverError && (
            <div role="alert" className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form onSubmit={step3.handleSubmit(onStep3Submit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                New Password <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  aria-invalid={!!step3.formState.errors.password}
                  className="pr-10"
                  {...step3.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!step3.formState.errors.password && (
                <p className="mt-1 text-xs text-muted-foreground">
                  At least 8 characters, 1 uppercase letter, and 1 number
                </p>
              )}
              <FieldError message={step3.formState.errors.password?.message} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirm Password <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  aria-invalid={!!step3.formState.errors.confirmPassword}
                  className="pr-10"
                  {...step3.register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={step3.formState.errors.confirmPassword?.message} />
            </div>

            <Button
              type="submit"
              disabled={step3.formState.isSubmitting}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {step3.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Resetting…</>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
