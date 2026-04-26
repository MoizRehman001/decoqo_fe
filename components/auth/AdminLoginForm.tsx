'use client';

/**
 * AdminLoginForm — single-step admin authentication.
 *
 * Security model:
 * - Email + password + TOTP submitted atomically (prevents username enumeration)
 * - Generic error messages — never reveals which field was wrong
 * - Dev mode: auto-fills 000000 as TOTP and shows prominent hint
 */

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Shield, Lock, Mail, KeyRound, Terminal } from 'lucide-react';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

const IS_DEV = process.env.NODE_ENV === 'development';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  totpCode: z
    .string()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const totpRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      totpCode: '',
    },
  });

  const { ref: totpFormRef, ...totpRest } = register('totpCode');

  const onSubmit = async (data: AdminLoginFormData) => {
    setServerError(null);
    try {
      const result = await authApi.adminLogin({
        email: data.email,
        password: data.password,
        totpCode: data.totpCode,
      });

      if (result.user.role !== 'ADMIN' && result.user.role !== 'SUPER_ADMIN') {
        setServerError('Access denied. Admin credentials required.');
        return;
      }

      document.cookie = `session_role=${result.user.role}; path=/; SameSite=Strict; Max-Age=14400`;
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { message?: string; statusCode?: number };
      if (apiErr?.statusCode === 429) {
        setServerError('Too many login attempts. Please wait 5 minutes before trying again.');
      } else {
        setServerError('Invalid credentials or authenticator code. Please try again.');
      }
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'var(--gold-gradient)' }}
          aria-hidden="true"
        >
          <Shield className="h-7 w-7 text-[hsl(0_0%_4%)]" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Admin Access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Secure two-factor authentication required
        </p>
      </div>

      {/* Dev mode banner */}
      {IS_DEV && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/20">
          <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-semibold">Dev mode — TOTP auto-filled as 000000</p>
            <p className="mt-0.5">
              The current valid TOTP code is also printed to the{' '}
              <strong>backend server console</strong> each time you submit.
              Check the terminal running the NestJS server.
            </p>
          </div>
        </div>
      )}

      {/* Security notice (prod only) */}
      {!IS_DEV && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/20">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            This portal is for authorised Decoqo administrators only. Unauthorised access attempts
            are logged and may result in legal action.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {serverError}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Admin Email <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@decoqo.com"
              aria-invalid={!!errors.email}
              className="pl-9"
              {...register('email')}
            />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              className="pl-9 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  totpRef.current?.focus();
                }
              }}
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

        {/* TOTP */}
        <div>
          <label htmlFor="admin-totp" className="mb-1.5 block text-sm font-medium text-foreground">
            Authenticator Code <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="admin-totp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              aria-invalid={!!errors.totpCode}
              className="pl-9 text-center text-lg font-semibold tracking-[0.4em]"
              ref={(el) => {
                totpFormRef(el);
                totpRef.current = el;
              }}
              {...totpRest}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {IS_DEV
              ? 'Dev: use 000000 as bypass, or check backend console for the live code'
              : '6-digit code from Google Authenticator or Authy'}
          </p>
          <FieldError message={errors.totpCode?.message} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verifying…</>
          ) : (
            <><Shield className="h-4 w-4" aria-hidden="true" /> Access Admin Panel</>
          )}
        </Button>
      </form>
    </div>
  );
}
