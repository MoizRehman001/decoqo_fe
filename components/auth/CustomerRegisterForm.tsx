'use client';

/**
 * Customer registration form.
 * AUTH-01: Customer registration with inline OTP verification
 *
 * Verification rules:
 *   - Email: optional. If entered, must be valid and verified.
 *   - Phone: optional. If entered, must be valid and verified.
 *   - At least one of email or phone must be provided and verified.
 *
 * Validation UX:
 *   - Errors shown inline below each field immediately on blur / on submit.
 *   - "Verify" button appears only when the field value passes format validation.
 *   - Verified state shown with green border + badge.
 *   - Editing a verified field resets its verification.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OtpVerifyDialog } from '@/components/auth/OtpVerifyDialog';
import apiClient from '@/lib/api/client';
import {
  customerRegisterSchema,
  type CustomerRegisterFormData,
} from '@/lib/validations/auth.schema';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Regex — must match schema definitions exactly
// ---------------------------------------------------------------------------

const VALID_PHONE_RE = /^[6-9]\d{9}$/;
const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
      <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      {label} verified
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CustomerRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<CustomerRegisterFormData>({
    resolver: zodResolver(customerRegisterSchema),
    mode: 'onBlur',          // validate on blur for immediate feedback
    reValidateMode: 'onChange', // re-validate on change after first submit
    defaultValues: {
      name: '',
      email: '',
      emailVerified: false,
      verifiedEmailToken: undefined,
      phone: '',
      phoneVerified: false,
      verifiedPhoneToken: undefined,
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  const phoneValue    = watch('phone') ?? '';
  const emailValue    = watch('email') ?? '';
  const phoneVerified = watch('phoneVerified');
  const emailVerified = watch('emailVerified');

  // Show verify button only when format is valid
  const isPhoneFormatValid = VALID_PHONE_RE.test(phoneValue.trim());
  const isEmailFormatValid = VALID_EMAIL_RE.test(emailValue.trim());

  // Show inline format error when field is touched and invalid
  const showPhoneFormatError = touchedFields.phone && phoneValue.trim() !== '' && !isPhoneFormatValid;

  const onSubmit = async (data: CustomerRegisterFormData) => {
    setServerError(null);
    try {
      const result = await apiClient.post<{
        userId: string;
        role: string;
        requiresOtpVerification: boolean;
        accessToken?: string;
        refreshToken?: string;
      }>('/auth/register/customer', {
        displayName: data.name,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        password: data.password,
        acceptedTerms: data.acceptedTerms,
        verifiedEmailToken: data.verifiedEmailToken,
        verifiedPhoneToken: data.verifiedPhoneToken,
      });

      // If pre-verified, backend activates immediately and returns tokens
      if (!result.requiresOtpVerification && result.accessToken) {
        const cookieOpts = 'path=/; SameSite=Lax';
        document.cookie = `session_role=${result.role}; ${cookieOpts}`;
        document.cookie = `refresh_token=${result.accessToken}; ${cookieOpts}`;
        router.push('/customer/dashboard');
        router.refresh();
        return;
      }

      // Otherwise go to OTP verification screen
      const params = new URLSearchParams({ type: 'customer' });
      if (data.email) params.set('email', data.email);
      if (data.phone) params.set('phone', data.phone);
      router.push(`/verify?${params.toString()}`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join thousands of homeowners transforming their spaces
        </p>
      </div>

      {serverError && (
        <div role="alert" className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* At-least-one hint */}
      <div className="mb-5 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-muted-foreground">
        Provide and verify at least one of <strong>email</strong> or <strong>mobile number</strong>.
        Verifying both gives you more login options.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
            Full Name <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Priya Sharma"
            aria-invalid={!!errors.name}
            className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* ── Email ──────────────────────────────────────────────────────────── */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email Address
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="priya@example.com"
              aria-invalid={!!errors.email || !!errors.emailVerified}
              disabled={emailVerified}
              className={cn(
                'flex-1 transition-colors',
                emailVerified
                  ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20'
                  : errors.email && 'border-destructive focus-visible:ring-destructive',
              )}
              {...register('email', {
                onBlur: () => trigger('email'),
                onChange: () => {
                  if (emailVerified) {
                    setValue('emailVerified', false);
                    setValue('verifiedEmailToken', undefined);
                  }
                },
              })}
            />

            {emailVerified ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-green-500 bg-green-50 px-3 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Verified
              </span>
            ) : isEmailFormatValid ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEmailDialogOpen(true)}
                className="shrink-0 border-accent text-accent hover:bg-accent/10"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Verify
              </Button>
            ) : null}
          </div>

          {/* Inline errors — format error takes priority over verification error */}
          <FieldError message={errors.email?.message} />
          {!errors.email && <FieldError message={errors.emailVerified?.message} />}

          {/* Nudge to verify when format is valid but not yet verified */}
          {!errors.email && isEmailFormatValid && !emailVerified && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              Click <strong>Verify</strong> to confirm your email address
            </p>
          )}
        </div>

        {/* ── Mobile Number ──────────────────────────────────────────────────── */}
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
            Mobile Number
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="flex gap-2">
            <div className="flex flex-1">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                maxLength={10}
                aria-invalid={!!errors.phone || !!errors.phoneVerified}
                disabled={phoneVerified}
                className={cn(
                  'rounded-l-none transition-colors',
                  phoneVerified
                    ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20'
                    : (errors.phone || showPhoneFormatError) && 'border-destructive focus-visible:ring-destructive',
                )}
                {...register('phone', {
                  onBlur: () => trigger('phone'),
                  onChange: (e) => {
                    // Strip non-digits as user types
                    e.target.value = e.target.value.replace(/\D/g, '');
                    if (phoneVerified) {
                      setValue('phoneVerified', false);
                      setValue('verifiedPhoneToken', undefined);
                    }
                  },
                })}
              />
            </div>

            {phoneVerified ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-green-500 bg-green-50 px-3 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Verified
              </span>
            ) : isPhoneFormatValid ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhoneDialogOpen(true)}
                className="shrink-0 border-accent text-accent hover:bg-accent/10"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Verify
              </Button>
            ) : null}
          </div>

          <FieldError message={errors.phone?.message} />
          {!errors.phone && <FieldError message={errors.phoneVerified?.message} />}

          {!errors.phone && isPhoneFormatValid && !phoneVerified && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              Click <strong>Verify</strong> to confirm your mobile number
            </p>
          )}
        </div>

        {/* Verified summary */}
        {(phoneVerified || emailVerified) && (
          <div className="flex flex-wrap gap-2">
            {emailVerified && <VerifiedBadge label="Email" />}
            {phoneVerified && <VerifiedBadge label="Mobile" />}
          </div>
        )}

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              aria-invalid={!!errors.password}
              className={cn('pr-10', errors.password && 'border-destructive focus-visible:ring-destructive')}
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
          {!errors.password && (
            <p className="mt-1 text-xs text-muted-foreground">
              At least 8 characters, 1 uppercase, 1 lowercase, and 1 number
            </p>
          )}
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirm Password */}
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
              aria-invalid={!!errors.confirmPassword}
              className={cn('pr-10', errors.confirmPassword && 'border-destructive focus-visible:ring-destructive')}
              {...register('confirmPassword')}
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
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-start gap-3">
            <input
              id="acceptedTerms"
              type="checkbox"
              aria-invalid={!!errors.acceptedTerms}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-input accent-accent"
              {...register('acceptedTerms')}
            />
            <label htmlFor="acceptedTerms" className="cursor-pointer text-sm text-muted-foreground">
              I agree to the{' '}
              <Link href="/legal/terms" target="_blank" rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
                Terms of Service
              </Link>{' '}and{' '}
              <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
                Privacy Policy
              </Link>
            </label>
          </div>
          <FieldError message={errors.acceptedTerms?.message} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Creating account…</>
            : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent underline underline-offset-2 hover:text-accent/80">
          Sign in
        </Link>
      </p>

      {/* OTP Dialogs */}
      <OtpVerifyDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        identifier={emailValue.trim()}
        channel="EMAIL"
        onVerified={(token) => {
          setValue('emailVerified', true, { shouldValidate: true });
          setValue('verifiedEmailToken', token);
          trigger(['emailVerified', 'phoneVerified']);
        }}
      />

      <OtpVerifyDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        identifier={`+91${phoneValue.trim()}`}
        channel="SMS"
        onVerified={(token) => {
          setValue('phoneVerified', true, { shouldValidate: true });
          setValue('verifiedPhoneToken', token);
          trigger(['emailVerified', 'phoneVerified']);
        }}
      />
    </div>
  );
}
