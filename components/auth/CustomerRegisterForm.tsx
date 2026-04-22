'use client';

/**
 * Customer registration form.
 *
 * AUTH-01: Customer registration with email/phone + password + OTP verification
 * AUTH-10: Policy acceptance on registration (Terms + Privacy Policy)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api/client';
import {
  customerRegisterSchema,
  type CustomerRegisterFormData,
} from '@/lib/validations/auth.schema';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-[#DC2626]">
      {message}
    </p>
  );
}

export function CustomerRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerRegisterFormData>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  const onSubmit = async (data: CustomerRegisterFormData) => {
    setServerError(null);
    try {
      await apiClient.post('/auth/register/customer', {
        name: data.name,
        email: data.email,
        password: data.password,
        acceptedTerms: data.acceptedTerms,
        ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
      });
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-[#1C1917]">Create your account</h1>
        <p className="mt-2 text-sm text-[#78716C]">
          Join thousands of homeowners transforming their spaces
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#DC2626]"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#1C1917]">
            Full Name <span aria-hidden="true" className="text-[#DC2626]">*</span>
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Priya Sharma"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1C1917]">
            Email Address <span aria-hidden="true" className="text-[#DC2626]">*</span>
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="priya@example.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Phone (optional) */}
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#1C1917]">
            Mobile Number{' '}
            <span className="text-xs font-normal text-[#A8A29E]">(optional)</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-[#78716C]">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              maxLength={10}
              aria-invalid={!!errors.phone}
              className="rounded-l-none"
              {...register('phone')}
            />
          </div>
          <FieldError message={errors.phone?.message} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1C1917]">
            Password <span aria-hidden="true" className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              aria-invalid={!!errors.password}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {!errors.password && (
            <p className="mt-1 text-xs text-[#A8A29E]">
              At least 8 characters, 1 uppercase letter, and 1 number
            </p>
          )}
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#1C1917]">
            Confirm Password <span aria-hidden="true" className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={!!errors.confirmPassword}
              className="pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C]"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {/* Terms — AUTH-10 */}
        <div>
          <div className="flex items-start gap-3">
            <input
              id="acceptedTerms"
              type="checkbox"
              aria-invalid={!!errors.acceptedTerms}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-input accent-[#C9A84C]"
              {...register('acceptedTerms')}
            />
            <label htmlFor="acceptedTerms" className="cursor-pointer text-sm text-[#78716C]">
              I agree to the{' '}
              <Link
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#C9A84C] underline underline-offset-2 hover:text-[#B8860B]"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#C9A84C] underline underline-offset-2 hover:text-[#B8860B]"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          <FieldError message={errors.acceptedTerms?.message} />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#C9A84C] text-white hover:bg-[#B8860B]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#78716C]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-[#C9A84C] underline underline-offset-2 hover:text-[#B8860B]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
