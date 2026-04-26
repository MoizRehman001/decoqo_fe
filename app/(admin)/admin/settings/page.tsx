'use client';

/**
 * Admin Settings — profile and account management for admin users.
 *
 * Shows:
 * - Current admin profile (email, role, ID)
 * - Password change form
 * - Active sessions with revoke capability
 * - Security info (TOTP status, last login)
 *
 * API: GET /auth/me — already integrated via useAuthStore
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield, User, Key, LogOut, CheckCircle2,
  Loader2, Eye, EyeOff, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth.store';
import apiClient from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Password change schema
// ---------------------------------------------------------------------------

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(12, 'New password must be at least 12 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/,
      'Must include uppercase, lowercase, digit, and special character',
    ),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        <h2 className="font-serif font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Password change form
// ---------------------------------------------------------------------------

function PasswordChangeForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setServerError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      setServerError(
        (err as { message?: string })?.message ?? 'Failed to change password. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Password changed successfully.
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-foreground">
          Current Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="currentPassword"
            type={showCurrent ? 'text' : 'password'}
            autoComplete="current-password"
            className="pl-9 pr-10"
            aria-invalid={!!errors.currentPassword}
            {...register('currentPassword')}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showCurrent ? 'Hide password' : 'Show password'}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError message={errors.currentPassword?.message} />
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-foreground">
          New Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="newPassword"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            className="pl-9 pr-10"
            aria-invalid={!!errors.newPassword}
            {...register('newPassword')}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showNew ? 'Hide password' : 'Show password'}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Min 12 chars — uppercase, lowercase, digit, and special character
        </p>
        <FieldError message={errors.newPassword?.message} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
          Confirm New Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="pl-9"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </div>
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isSubmitting
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Changing…</>
          : <><Key className="h-4 w-4" /> Change Password</>}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminSettingsPage() {
  const { user, logout } = useAuthStore();

  const profileRows = [
    { label: 'Email',   value: user?.email ?? '—' },
    { label: 'Role',    value: user?.role ?? '—' },
    { label: 'User ID', value: user?.id ?? '—' },
    { label: 'Status',  value: user?.isVerified ? 'Verified ✓' : 'Pending' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Admin Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your admin account and security settings.
        </p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="space-y-0 divide-y divide-border">
          {profileRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className={cn(
                'text-sm font-medium text-foreground',
                row.label === 'User ID' && 'font-mono text-xs text-muted-foreground',
              )}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication (TOTP)</p>
              <p className="text-xs text-muted-foreground">
                Required for all admin accounts — managed via Google Authenticator or Authy
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-300">
              <CheckCircle2 className="h-3 w-3" /> Enabled
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            To reset your TOTP secret, contact another SUPER_ADMIN to provision a new account.
          </p>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" icon={Key}>
        <PasswordChangeForm />
      </Section>

      {/* Danger zone */}
      <Section title="Session" icon={LogOut}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="text-xs text-muted-foreground">
              Revokes your current session and clears all local auth state.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="gap-2 text-destructive hover:border-destructive/40 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </Section>
    </div>
  );
}
