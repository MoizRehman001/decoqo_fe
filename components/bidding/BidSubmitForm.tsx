'use client';

/**
 * BidSubmitForm — vendor side bid submission.
 * VEND-20: Bid form: total quote, timeline, material level, scope assumptions, notes
 * VEND-21: One bid per project (duplicate prevented)
 */

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSubmitBid } from '@/lib/api/bidding';
import { inrToPaise } from '@/lib/utils/money';
import type { MaterialLevel } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const bidSchema = z.object({
  quoteInr: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Quote must be positive')
    .min(10000, 'Minimum quote is ₹10,000'),
  timelineWeeks: z
    .number({ invalid_type_error: 'Please enter a valid number' })
    .int()
    .min(1, 'Minimum 1 week')
    .max(52, 'Maximum 52 weeks'),
  materialLevel: z.enum(['ECONOMY', 'STANDARD', 'PREMIUM', 'LUXURY'] as const),
  scopeAssumptions: z
    .string()
    .min(20, 'Please describe your scope assumptions (min 20 characters)')
    .max(1000),
  notes: z.string().max(500).optional(),
});

type BidFormData = z.infer<typeof bidSchema>;

const MATERIAL_OPTIONS: { value: MaterialLevel; label: string; desc: string; color: string }[] = [
  { value: 'ECONOMY', label: 'Economy', desc: 'Budget-friendly materials', color: 'hsl(0 0% 50%)' },
  { value: 'STANDARD', label: 'Standard', desc: 'Good quality, mid-range', color: 'hsl(217 65% 60%)' },
  { value: 'PREMIUM', label: 'Premium', desc: 'High-end finishes', color: 'hsl(40 45% 55%)' },
  { value: 'LUXURY', label: 'Luxury', desc: 'Top-tier materials', color: 'hsl(280 60% 65%)' },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
}

interface BidSubmitFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function BidSubmitForm({ projectId, onSuccess }: BidSubmitFormProps) {
  const submitMutation = useSubmitBid();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      quoteInr: undefined,
      timelineWeeks: undefined,
      materialLevel: 'STANDARD',
      scopeAssumptions: '',
      notes: '',
    },
  });

  const onSubmit = async (data: BidFormData) => {
    await submitMutation.mutateAsync({
      projectId,
      quotePaise: inrToPaise(data.quoteInr),
      timelineWeeks: data.timelineWeeks,
      materialLevel: data.materialLevel,
      scopeAssumptions: data.scopeAssumptions,
      notes: data.notes ?? '',
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {submitMutation.isError && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(submitMutation.error as { message?: string })?.message ?? 'Failed to submit bid. Please try again.'}
        </div>
      )}

      {/* Quote */}
      <div>
        <label htmlFor="quoteInr" className="mb-1.5 block text-sm font-medium text-foreground">
          Total Quote (₹) <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="quoteInr"
            type="number"
            placeholder="850000"
            aria-invalid={!!errors.quoteInr}
            className="pl-9"
            {...register('quoteInr', { valueAsNumber: true })}
          />
        </div>
        <FieldError message={errors.quoteInr?.message} />
      </div>

      {/* Timeline */}
      <div>
        <label htmlFor="timelineWeeks" className="mb-1.5 block text-sm font-medium text-foreground">
          Timeline (weeks) <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="timelineWeeks"
          type="number"
          placeholder="8"
          min={1}
          max={52}
          aria-invalid={!!errors.timelineWeeks}
          {...register('timelineWeeks', { valueAsNumber: true })}
        />
        <FieldError message={errors.timelineWeeks?.message} />
      </div>

      {/* Material Level */}
      <div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">
            Material Level <span className="text-destructive" aria-hidden="true">*</span>
          </legend>
          <Controller
            name="materialLevel"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_OPTIONS.map((opt) => {
                  const isSelected = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-card hover:border-accent/40',
                      )}
                    >
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isSelected ? opt.color : undefined }}
                      >
                        {opt.label}
                      </span>
                      <span className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </fieldset>
        <FieldError message={errors.materialLevel?.message} />
      </div>

      {/* Scope Assumptions */}
      <div>
        <label htmlFor="scopeAssumptions" className="mb-1.5 block text-sm font-medium text-foreground">
          Scope Assumptions <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <textarea
          id="scopeAssumptions"
          rows={3}
          placeholder="Describe what is included in your quote — materials, brands, specific items…"
          aria-invalid={!!errors.scopeAssumptions}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 resize-none"
          {...register('scopeAssumptions')}
        />
        <FieldError message={errors.scopeAssumptions?.message} />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-foreground">
          Additional Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={2}
          placeholder="Any additional information for the customer…"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 resize-none"
          {...register('notes')}
        />
        <FieldError message={errors.notes?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || submitMutation.isPending}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isSubmitting || submitMutation.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Submitting bid…</>
        ) : (
          'Submit Bid'
        )}
      </Button>
    </form>
  );
}
