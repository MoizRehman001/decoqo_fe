'use client';

/**
 * Admin login form — two-step: credentials → TOTP.
 * AUTH-09: Admin login with TOTP
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Shield, ChevronRight } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const credentialsSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const totpSchema = z.object({
  totp: z
    .string()
    .length(6, 'TOTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'TOTP must contain only digits'),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;
type TotpFormData = z.infer<typeof totpSchema>;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Credentials
// ---------------------------------------------------------------------------

interface Step1Props {
  onSuccess: (email: string) => void;
}

function CredentialsStep({ onSuccess }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: CredentialsFormData) => {
    setServerError(null);
    try {
      // Validate credentials first (mock: any admin email works)
      const result = await authApi.login({ identifier: data.email, password: data.password });
      if (result.user.role !== 'ADMIN' && result.user.role !== 'SUPER_ADMIN') {
        throw { message: 'Access denied. Admin credentials required.' };
      }
      onSuccess(data.email);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Invalid credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-foreground">
          Admin Email <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="username"
          placeholder="admin@decoqo.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-foreground">
          Password <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="admin-password"
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Verifying…
          </>
        ) : (
          <>
            Continue
            <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Step 2: TOTP
// ---------------------------------------------------------------------------

interface Step2Props {
  email: string;
  onBack: () => void;
}

function TotpStep({ email, onBack }: Step2Props) {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TotpFormData>({
    resolver: zodResolver(totpSchema),
    defaultValues: { totp: '' },
  });

  const onSubmit = async (data: TotpFormData) => {
    setServerError(null);
    try {
      const { user, accessToken } = await authApi.verifyAdminTotp(email, data.totp);
      setAccessToken(accessToken);
      setUser(user);
      document.cookie = `session_role=${user.role}; path=/; SameSite=Lax`;
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Invalid TOTP code. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
        <p className="text-xs text-muted-foreground">Signing in as</p>
        <p className="text-sm font-medium text-foreground">{email}</p>
      </div>

      <div>
        <label htmlFor="totp" className="mb-1.5 block text-sm font-medium text-foreground">
          Authenticator Code <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <Input
          id="totp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete="one-time-code"
          placeholder="000000"
          aria-invalid={!!errors.totp}
          className="text-center text-lg font-semibold tracking-widest"
          {...register('totp')}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
        <FieldError message={errors.totp?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Verifying…
          </>
        ) : (
          'Access Admin Panel'
        )}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        ← Back to credentials
      </button>

      {process.env.NODE_ENV === 'development' && (
        <p className="text-center text-xs text-muted-foreground/60">
          Dev: use <code className="rounded bg-muted px-1">000000</code> as universal TOTP
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AdminLoginForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [adminEmail, setAdminEmail] = useState('');

  const handleCredentialsSuccess = (email: string) => {
    setAdminEmail(email);
    setStep(2);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Shield className="h-7 w-7 text-accent" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Admin Access
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Secure two-factor authentication required
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2" aria-label="Login steps">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                step === s
                  ? 'bg-accent text-accent-foreground'
                  : step > s
                    ? 'bg-accent/20 text-accent'
                    : 'bg-muted text-muted-foreground',
              )}
              aria-current={step === s ? 'step' : undefined}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className={cn(
                  'h-px w-8 transition-colors',
                  step > s ? 'bg-accent' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-4 text-center text-sm font-medium text-foreground">
        {step === 1 ? 'Step 1: Enter credentials' : 'Step 2: Authenticator code'}
      </div>

      {step === 1 ? (
        <CredentialsStep onSuccess={handleCredentialsSuccess} />
      ) : (
        <TotpStep email={adminEmail} onBack={() => setStep(1)} />
      )}
    </div>
  );
}
