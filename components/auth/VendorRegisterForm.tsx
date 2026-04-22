'use client';

/**
 * Vendor registration form.
 * AUTH-02: Vendor registration with business details + OTP verification
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import {
  vendorRegisterSchema,
  type VendorRegisterFormData,
} from '@/lib/validations/auth.schema';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
] as const;

const CATEGORIES = [
  { id: 'modular_kitchen', label: 'Modular Kitchen' },
  { id: 'living_room', label: 'Living Room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'full_home', label: 'Full Home' },
  { id: 'office', label: 'Office' },
  { id: 'bathroom', label: 'Bathroom' },
] as const;

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
// Main Component
// ---------------------------------------------------------------------------

export function VendorRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendorRegisterFormData>({
    resolver: zodResolver(vendorRegisterSchema),
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      phone: '',
      city: '',
      categories: [],
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  const selectedCategories = watch('categories');

  const onSubmit = async (data: VendorRegisterFormData) => {
    setServerError(null);
    try {
      await authApi.registerVendor({
        name: data.name,
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        categories: data.categories,
        password: data.password,
        acceptedTerms: data.acceptedTerms,
      });
      router.push(`/verify?email=${encodeURIComponent(data.email)}&type=vendor`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setServerError(apiErr?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Join as a Vendor
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Grow your interior design business with verified clients
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
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
            Full Name <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Arjun Kapoor"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-foreground">
            Business Name <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <Input
            id="businessName"
            type="text"
            autoComplete="organization"
            placeholder="Arjun Interiors Pvt. Ltd."
            aria-invalid={!!errors.businessName}
            {...register('businessName')}
          />
          <FieldError message={errors.businessName?.message} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Business Email <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="arjun@interiors.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
            Mobile Number <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
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

        {/* City */}
        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-foreground">
            City <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <select
            id="city"
            aria-invalid={!!errors.city}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.city && 'border-destructive',
            )}
            {...register('city')}
          >
            <option value="">Select your city</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <FieldError message={errors.city?.message} />
        </div>

        {/* Categories */}
        <div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">
              Service Categories <span aria-hidden="true" className="text-destructive">*</span>
            </legend>
            <p className="mb-3 text-xs text-muted-foreground">
              Select all categories you specialise in
            </p>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map((cat) => {
                    const isSelected = field.value.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => {
                          const next = isSelected
                            ? field.value.filter((v) => v !== cat.id)
                            : [...field.value, cat.id];
                          field.onChange(next);
                        }}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                          isSelected
                            ? 'border-accent bg-accent/10 text-accent font-medium'
                            : 'border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                            isSelected
                              ? 'border-accent bg-accent text-accent-foreground'
                              : 'border-muted-foreground',
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </fieldset>
          <FieldError message={errors.categories?.message} />
        </div>

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
          {!errors.password && (
            <p className="mt-1 text-xs text-muted-foreground">
              At least 8 characters, 1 uppercase letter, and 1 number
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
              className="pr-10"
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
              <Link
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          <FieldError message={errors.acceptedTerms?.message} />
        </div>

        {/* Hidden field to suppress unused warning */}
        <input type="hidden" value={selectedCategories.length} aria-hidden="true" />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            'Create Vendor Account'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
