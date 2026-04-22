'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWizard } from './WizardShell';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const locationSchema = z.object({
  title: z
    .string()
    .min(5, 'Project title must be at least 5 characters')
    .max(120, 'Project title must be at most 120 characters')
    .trim(),
  city: z.string().min(1, 'Please select a city'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian pincode'),
});

type LocationFormData = z.infer<typeof locationSchema>;

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
}

export function Step2Location() {
  const { state, dispatch, goNext } = useWizard();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      title: state.title,
      city: state.city,
      pincode: state.pincode,
    },
  });

  // Sync from wizard state when navigating back
  useEffect(() => {
    reset({ title: state.title, city: state.city, pincode: state.pincode });
  }, [state.title, state.city, state.pincode, reset]);

  const onSubmit = (data: LocationFormData) => {
    dispatch({ type: 'SET_LOCATION', payload: data });
    goNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Where is your project located?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Give your project a name and tell us the location
        </p>
      </div>

      <div className="space-y-5">
        {/* Project Title */}
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
            Project Title <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            type="text"
            placeholder="e.g. 3BHK Full Home Renovation — Koramangala"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          <FieldError message={errors.title?.message} />
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
              errors.city && 'border-destructive',
            )}
            {...register('city')}
          >
            <option value="">Select your city</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <FieldError message={errors.city?.message} />
        </div>

        {/* Pincode */}
        <div>
          <label htmlFor="pincode" className="mb-1.5 block text-sm font-medium text-foreground">
            Pincode <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <Input
            id="pincode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="560034"
            aria-invalid={!!errors.pincode}
            {...register('pincode')}
          />
          <FieldError message={errors.pincode?.message} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Continue
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
