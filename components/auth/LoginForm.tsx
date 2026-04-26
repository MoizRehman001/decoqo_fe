'use client';

/**
 * Login form — two modes:
 *   1. Password login  (default)
 *   2. OTP login       (passwordless — only for verified accounts)
 *
 * AUTH-03: Login with email or phone + password
 *
 * Navigation: uses router.push + router.refresh() instead of
 * window.location.href so React state is preserved on error and
 * the middleware re-reads cookies without a full browser reload.
 */

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/types/api.types';

// ---------------------------------------------------------------------------
// OTP login schema
// ---------------------------------------------------------------------------

const otpLoginSchema = z.object({
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
type OtpLoginIdentifierForm = z.infer<typeof otpLoginSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6;

function getRoleRedirect(role: string): string {
  switch (role) {
    case 'CUSTOMER': return '/customer/dashboard';
    case 'VENDOR':   return '/vendor/dashboard';
    case 'ADMIN':
    case 'SUPER_ADMIN': return '/admin/dashboard';
    default: return '/';
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // OTP login state
  const [loginMode, setLoginMode] = useState<'password' | 'otp-identifier' | 'otp-code'>('password');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  // Password login form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  // OTP identifier form
  const otpIdentifierForm = useForm<OtpLoginIdentifierForm>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: { identifier: '' },
  });

  // ── Shared login success handler ───────────────────────────────────────────
  const handleLoginSuccess = (user: { id: string; role: string; displayName: string }, accessToken: string) => {
    setAccessToken(accessToken);
    setUser({
      id: user.id,
      name: user.displayName,
      role: user.role as AuthUser['role'],
      email: '',
      isVerified: true,
    });
    // Write session cookies so middleware sees them on the next request
    const cookieOpts = 'path=/; SameSite=Lax';
    document.cookie = `session_role=${user.role}; ${cookieOpts}`;
    document.cookie = `refresh_token=${accessToken}; ${cookieOpts}`;
    // router.push keeps React state alive; router.refresh() re-runs server
    // components so middleware picks up the new cookies without a full reload
    router.push(getRoleRedirect(user.role));
    router.refresh();
  };

  // ── Password login ─────────────────────────────────────────────────────────
  const onPasswordSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const result = await authApi.login({ identifier: data.identifier, password: data.password });
      handleLoginSuccess(result.user, result.accessToken);
    } catch (err: unknown) {
      const raw = err as { message?: string };
      // Check if backend returned PENDING_VERIFICATION with redirect info
      try {
        const parsed = JSON.parse(raw.message ?? '{}') as {
          code?: string; message?: string; email?: string; phone?: string;
        };
        if (parsed.code === 'PENDING_VERIFICATION') {
          const params = new URLSearchParams({ type: 'pending' });
          if (parsed.email) params.set('email', parsed.email);
          if (parsed.phone) {
            params.set('phone', parsed.phone.replace(/^\+91/, ''));
          }
          // Use router.push — no full reload, form state preserved until navigation
          router.push(`/verify?${params.toString()}`);
          return;
        }
      } catch {
        // Not JSON — fall through to generic error
      }
      setServerError(raw.message ?? 'Invalid credentials. Please try again.');
    }
  };

  // ── OTP login — step 1: send OTP ───────────────────────────────────────────
  const onOtpIdentifierSubmit = async (data: OtpLoginIdentifierForm) => {
    setServerError(null);
    setIsSendingOtp(true);
    try {
      await authApi.sendLoginOtp(data.identifier);
      setOtpIdentifier(data.identifier);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setOtpSent(true);
      setLoginMode('otp-code');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── OTP login — step 2: verify OTP ────────────────────────────────────────
  const handleOtpVerify = async () => {
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) { setServerError('Please enter all 6 digits.'); return; }
    setServerError(null);
    setIsVerifyingOtp(true);
    try {
      const result = await authApi.verifyLoginOtp(otpIdentifier, otp);
      handleLoginSuccess(result.user, result.accessToken);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Invalid OTP. Please try again.');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setServerError(null);
    setIsSendingOtp(true);
    try {
      await authApi.sendLoginOtp(otpIdentifier);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Failed to resend OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── OTP digit handlers ─────────────────────────────────────────────────────
  const handleDigitChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setServerError(null);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }, [otpDigits]);

  const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        const next = [...otpDigits]; next[index] = ''; setOtpDigits(next);
      } else if (index > 0) inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }, [otpDigits]);

  const handleDigitPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] ?? '';
    setOtpDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }, []);

  const isOtpComplete = otpDigits.every((d) => d !== '');

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your Decoqo account</p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-lg border border-input bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => { setLoginMode('password'); setServerError(null); }}
          className={cn(
            'flex-1 rounded-md py-2 text-sm font-medium transition-all',
            loginMode === 'password'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => { setLoginMode('otp-identifier'); setServerError(null); setOtpSent(false); }}
          className={cn(
            'flex-1 rounded-md py-2 text-sm font-medium transition-all',
            loginMode !== 'password'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          OTP Login
        </button>
      </div>

      {serverError && (
        <div role="alert" className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* ── Password Login ─────────────────────────────────────────────────── */}
      {loginMode === 'password' && (
        <form onSubmit={handleSubmit(onPasswordSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-foreground">
              Email or Mobile Number <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="priya@example.com or 9876543210"
              aria-invalid={!!errors.identifier}
              {...register('identifier')}
            />
            <FieldError message={errors.identifier?.message} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Link href="/forgot-password" className="text-xs text-accent underline underline-offset-2 hover:text-accent/80">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register('password')}
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
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : 'Sign In'}
          </Button>
        </form>
      )}

      {/* ── OTP Login — Step 1: Enter identifier ──────────────────────────── */}
      {loginMode === 'otp-identifier' && (
        <form onSubmit={otpIdentifierForm.handleSubmit(onOtpIdentifierSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="otp-identifier" className="mb-1.5 block text-sm font-medium text-foreground">
              Email or Mobile Number <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <Input
              id="otp-identifier"
              type="text"
              autoComplete="username"
              placeholder="priya@example.com or 9876543210"
              aria-invalid={!!otpIdentifierForm.formState.errors.identifier}
              {...otpIdentifierForm.register('identifier')}
            />
            <FieldError message={otpIdentifierForm.formState.errors.identifier?.message} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              We&apos;ll send a one-time code to your registered email or phone.
            </p>
          </div>

          <Button type="submit" disabled={isSendingOtp} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {isSendingOtp ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP…</> : 'Send OTP'}
          </Button>
        </form>
      )}

      {/* ── OTP Login — Step 2: Enter OTP ─────────────────────────────────── */}
      {loginMode === 'otp-code' && (
        <div className="space-y-5">
          <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-foreground">
            OTP sent to <span className="font-medium">{otpIdentifier}</span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-center gap-2" role="group" aria-label="OTP input">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  onPaste={handleDigitPaste}
                  aria-label={`Digit ${i + 1}`}
                  className={cn(
                    'h-12 w-11 rounded-lg border text-center text-lg font-semibold',
                    'bg-background text-foreground transition-all duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                    digit ? 'border-accent bg-accent/5' : 'border-input',
                  )}
                />
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOtpVerify}
            disabled={isVerifyingOtp || !isOtpComplete}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isVerifyingOtp ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : 'Sign In with OTP'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setLoginMode('otp-identifier'); setServerError(null); }}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Change number/email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isSendingOtp}
              className="inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:text-accent/80 disabled:opacity-50"
            >
              {isSendingOtp ? <><RefreshCw className="h-3 w-3 animate-spin" />Resending…</> : 'Resend OTP'}
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
              Dev: Check the backend console for the OTP code
            </p>
          )}
        </div>
      )}

      {/* ── Footer links ──────────────────────────────────────────────────── */}
      <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
        <p>
          New customer?{' '}
          <Link href="/register/customer" className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
            Create account
          </Link>
        </p>
        <p>
          Are you a vendor?{' '}
          <Link href="/register/vendor" className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
            Register as vendor
          </Link>
        </p>
      </div>
    </div>
  );
}
