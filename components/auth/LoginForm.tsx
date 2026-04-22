'use client';

/**
 * Login form — email or phone, password, role-based redirect.
 * AUTH-03: Login with email or phone + password
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const { setAccessToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const { user, accessToken } = await authApi.login({
        identifier: data.identifier,
        password: data.password,
      });

      // Store token in memory
      setAccessToken(accessToken);
      setUser(user);

      // Set cookies for middleware session detection
      const cookieOpts = 'path=/; SameSite=Lax';
      document.cookie = `session_role=${user.role}; ${cookieOpts}`;
      document.cookie = `refresh_token=${accessToken}; ${cookieOpts}`;

      // Full navigation so middleware sees the new cookies on the next request
      window.location.href = getRoleRedirect(user.role);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your Decoqo account
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email or Phone */}
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
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            {...register('identifier')}
          />
          <FieldError message={errors.identifier?.message} />
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent underline underline-offset-2 hover:text-accent/80"
            >
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
        <p>
          New customer?{' '}
          <Link
            href="/register/customer"
            className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
          >
            Create account
          </Link>
        </p>
        <p>
          Are you a vendor?{' '}
          <Link
            href="/register/vendor"
            className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
          >
            Register as vendor
          </Link>
        </p>
      </div>
    </div>
  );
}
