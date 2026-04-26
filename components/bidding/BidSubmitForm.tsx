'use client';

/**
 * BidSubmitForm — professional BOQ-based bid submission.
 *
 * Fix log:
 * - watch() returns strings from HTML inputs → coerce with Number() before multiply
 * - Design upload is optional (no validation gate)
 * - Scope Exclusions + Notes always visible
 * - Grand total = sum of (Number(qty) * Number(rate)) per row
 */

import { useCallback, useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Trash2, Loader2, IndianRupee,
  ChevronDown, ChevronUp, Package, Info, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSubmitBid } from '@/lib/api/bidding';
import { formatInr } from '@/lib/utils/money';
import type { MaterialLevel } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORK_CATEGORIES = [
  'Flooring', 'Wall Finish / Paint', 'False Ceiling', 'Furniture',
  'Modular Kitchen', 'Wardrobes', 'Lighting', 'Electrical',
  'Plumbing', 'HVAC / AC', 'Doors & Windows', 'Tiling',
  'Waterproofing', 'Landscaping', 'Miscellaneous',
] as const;

const UNITS = ['sqft', 'sqm', 'rft', 'nos', 'ls', 'kg', 'bag', 'box', 'set', 'mtr'] as const;

const MATERIAL_OPTIONS: Array<{ value: MaterialLevel; label: string; desc: string; color: string }> = [
  { value: 'ECONOMY',  label: 'Economy',  desc: 'Budget-friendly, functional',  color: 'hsl(0 0% 50%)' },
  { value: 'STANDARD', label: 'Standard', desc: 'Good quality, mid-range',       color: 'hsl(217 65% 60%)' },
  { value: 'PREMIUM',  label: 'Premium',  desc: 'High-end finishes & brands',    color: 'hsl(40 45% 55%)' },
  { value: 'LUXURY',   label: 'Luxury',   desc: 'Top-tier, imported materials',  color: 'hsl(280 60% 65%)' },
];

// ---------------------------------------------------------------------------
// Schema — z.coerce.number() handles string→number from HTML inputs
// ---------------------------------------------------------------------------

const boqItemSchema = z.object({
  room:        z.string().min(1, 'Select a room'),
  category:    z.string().min(1, 'Select a category'),
  description: z.string().min(2, 'Enter a description').max(300),
  material:    z.string().max(100).optional(),
  brand:       z.string().max(100).optional(),
  quantity:    z.coerce.number().positive('Must be > 0'),
  unit:        z.string().min(1),
  rateInr:     z.coerce.number().positive('Must be > 0'),
  notes:       z.string().max(300).optional(),
});

const bidSchema = z.object({
  timelineWeeks:        z.coerce.number().int().min(1, 'Min 1 week').max(104, 'Max 104 weeks'),
  materialQualityLevel: z.enum(['ECONOMY', 'STANDARD', 'PREMIUM', 'LUXURY'] as const),
  boqItems:             z.array(boqItemSchema).min(1, 'Add at least one BOQ line item'),
  scopeExclusions:      z.string().max(2000).optional(),
  notes:                z.string().max(1000).optional(),
});

type BidFormData = z.infer<typeof bidSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Safely multiply two values that may be strings from HTML inputs */
function rowAmount(qty: unknown, rate: unknown): number {
  const q = Number(qty);
  const r = Number(rate);
  return isNaN(q) || isNaN(r) ? 0 : q * r;
}

function makeItem(room = ''): BidFormData['boqItems'][number] {
  return { room, category: '', description: '', material: '', brand: '', quantity: 0, unit: 'sqft', rateInr: 0, notes: '' };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-destructive">{message}</p>;
}

// ---------------------------------------------------------------------------
// BOQ Row
// ---------------------------------------------------------------------------

interface BoqRowProps {
  index: number;
  rooms: string[];
  register: ReturnType<typeof useForm<BidFormData>>['register'];
  watch: ReturnType<typeof useForm<BidFormData>>['watch'];
  errors: ReturnType<typeof useForm<BidFormData>>['formState']['errors'];
  onRemove: () => void;
  canRemove: boolean;
}

function BoqRow({ index, rooms, register, watch, errors, onRemove, canRemove }: BoqRowProps) {
  const [expanded, setExpanded] = useState(true);

  // watch returns raw strings from <input type="number"> — use Number() to coerce
  const qty    = watch(`boqItems.${index}.quantity`);
  const rate   = watch(`boqItems.${index}.rateInr`);
  const desc   = watch(`boqItems.${index}.description`) ?? '';
  const amount = rowAmount(qty, rate);
  const rowErrs = errors.boqItems?.[index];

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <Package className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {desc || `Item ${index + 1}`}
          </span>
          <span className="shrink-0 text-sm font-semibold text-accent">
            {amount > 0 ? formatInr(amount) : '—'}
          </span>
          {expanded
            ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove item"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="grid gap-3 border-t border-border px-4 pb-4 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Room */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Room *</label>
            <select
              {...register(`boqItems.${index}.room`)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select room…</option>
              {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="Common Area">Common Area</option>
              <option value="Other">Other</option>
            </select>
            <FieldError message={rowErrs?.room?.message} />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Work Category *</label>
            <select
              {...register(`boqItems.${index}.category`)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select category…</option>
              {WORK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <FieldError message={rowErrs?.category?.message} />
          </div>

          {/* Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description *</label>
            <Input
              {...register(`boqItems.${index}.description`)}
              placeholder="e.g. Italian Marble 600×600mm"
              className="h-9 text-sm"
            />
            <FieldError message={rowErrs?.description?.message} />
          </div>

          {/* Material */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Material</label>
            <Input
              {...register(`boqItems.${index}.material`)}
              placeholder="e.g. Vitrified Tile"
              className="h-9 text-sm"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Brand</label>
            <Input
              {...register(`boqItems.${index}.brand`)}
              placeholder="e.g. Kajaria"
              className="h-9 text-sm"
            />
          </div>

          {/* Qty + Unit */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Qty *</label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                placeholder="0"
                className="h-9 text-sm"
                {...register(`boqItems.${index}.quantity`)}
              />
              <FieldError message={rowErrs?.quantity?.message} />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Unit *</label>
              <select
                {...register(`boqItems.${index}.unit`)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Rate */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Rate / Unit (₹) *</label>
            <div className="relative">
              <IndianRupee className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                placeholder="0"
                className="h-9 pl-7 text-sm"
                {...register(`boqItems.${index}.rateInr`)}
              />
            </div>
            <FieldError message={rowErrs?.rateInr?.message} />
          </div>

          {/* Amount — computed display, always correct */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount</label>
            <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm font-semibold text-foreground">
              {amount > 0 ? formatInr(amount) : '—'}
            </div>
          </div>

          {/* Item Notes */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Item Notes</label>
            <Input
              {...register(`boqItems.${index}.notes`)}
              placeholder="e.g. Includes adhesive and grouting"
              className="h-9 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Design upload — optional, no validation gate
// ---------------------------------------------------------------------------

interface DesignUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
}

function DesignUploadSection({ files, onChange }: DesignUploadProps) {
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onChange([...files, ...selected].slice(0, 10));
    // Reset input so same file can be re-added after removal
    e.target.value = '';
  };

  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Design & Work Samples
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Mood boards, 3D renders, past work photos, floor plan sketches — max 10 files
          </p>
        </div>
      </div>

      <label
        htmlFor="design-upload"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-5',
          'text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1',
        )}
      >
        <Upload className="h-5 w-5" aria-hidden="true" />
        <span>Click to upload or drag & drop</span>
        <span className="text-xs">PNG, JPG, PDF — up to 10 MB each</span>
        <input
          id="design-upload"
          type="file"
          multiple
          accept="image/*,.pdf"
          className="sr-only"
          onChange={handleFiles}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="truncate text-foreground">{f.name}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${f.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface BidSubmitFormProps {
  projectId: string;
  projectRooms?: string[];
  onSuccess?: () => void;
}

export function BidSubmitForm({ projectId, projectRooms = [], onSuccess }: BidSubmitFormProps) {
  const submitMutation = useSubmitBid();
  const [designFiles, setDesignFiles] = useState<File[]>([]);

  const defaultItems = useMemo(
    () => projectRooms.length > 0 ? projectRooms.map(makeItem) : [makeItem()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      timelineWeeks:        undefined,
      materialQualityLevel: 'STANDARD',
      boqItems:             defaultItems,
      scopeExclusions:      '',
      notes:                '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'boqItems' });

  // Grand total — coerce all values with Number() to handle string inputs
  const watchedItems = watch('boqItems');
  const grandTotal = useMemo(
    () => (watchedItems ?? []).reduce((s, it) => s + rowAmount(it.quantity, it.rateInr), 0),
    [watchedItems],
  );

  const addItem = useCallback(() => {
    const lastRoom = watchedItems?.[watchedItems.length - 1]?.room ?? projectRooms[0] ?? '';
    append(makeItem(lastRoom));
  }, [append, watchedItems, projectRooms]);

  const onSubmit = async (data: BidFormData) => {
    await submitMutation.mutateAsync({
      projectId,
      timelineWeeks:        data.timelineWeeks,
      materialQualityLevel: data.materialQualityLevel,
      boqItems:             data.boqItems,
      scopeExclusions:      data.scopeExclusions || undefined,
      notes:                data.notes || undefined,
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {submitMutation.isError && (
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(submitMutation.error as { message?: string })?.message ?? 'Failed to submit bid. Please try again.'}
        </div>
      )}

      {/* ── 1. BOQ ───────────────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Bill of Quantities (BOQ)</h3>
            <p className="text-xs text-muted-foreground">
              Pre-filled with project rooms — add line items per room
            </p>
          </div>
          {grandTotal > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Grand Total</p>
              <p className="font-serif text-lg font-bold text-accent">{formatInr(grandTotal)}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {fields.map((field, i) => (
            <BoqRow
              key={field.id}
              index={i}
              rooms={projectRooms}
              register={register}
              watch={watch}
              errors={errors}
              onRemove={() => remove(i)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>

        {errors.boqItems?.message && (
          <p role="alert" className="mt-1 text-xs text-destructive">{errors.boqItems.message}</p>
        )}

        <button
          type="button"
          onClick={addItem}
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3',
            'text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Line Item
        </button>
      </section>

      {/* ── 2. Timeline & Material Level ─────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="timelineWeeks" className="mb-1.5 block text-sm font-medium text-foreground">
            Proposed Timeline (weeks) <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <Input
            id="timelineWeeks"
            type="number"
            placeholder="10"
            min={1}
            max={104}
            aria-invalid={!!errors.timelineWeeks}
            className="h-10"
            {...register('timelineWeeks')}
          />
          <FieldError message={errors.timelineWeeks?.message} />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">
            Overall Material Level <span className="text-destructive" aria-hidden="true">*</span>
          </p>
          <Controller
            name="materialQualityLevel"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_OPTIONS.map((opt) => {
                  const sel = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      aria-pressed={sel}
                      className={cn(
                        'flex flex-col items-start rounded-xl border p-2.5 text-left transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                        sel ? 'border-accent bg-accent/10' : 'border-border bg-card hover:border-accent/40',
                      )}
                    >
                      <span className="text-xs font-semibold" style={{ color: sel ? opt.color : undefined }}>
                        {opt.label}
                      </span>
                      <span className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
      </section>

      {/* ── 3. Design & Work Samples (optional) ──────────────────────── */}
      <DesignUploadSection files={designFiles} onChange={setDesignFiles} />

      {/* ── 4. Scope Exclusions ───────────────────────────────────────── */}
      <section>
        <label htmlFor="scopeExclusions" className="mb-1.5 block text-sm font-medium text-foreground">
          Scope Exclusions
          <span className="ml-1 text-xs font-normal text-muted-foreground">(what is NOT included in this quote)</span>
        </label>
        <textarea
          id="scopeExclusions"
          rows={3}
          placeholder="e.g. Excludes electrical rewiring, plumbing, civil work, false ceiling in bathrooms…"
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          {...register('scopeExclusions')}
        />
        <FieldError message={errors.scopeExclusions?.message} />
      </section>

      {/* ── 5. Additional Notes ───────────────────────────────────────── */}
      <section>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-foreground">
          Additional Notes
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={2}
          placeholder="e.g. Site visit required before finalising tile selection. Lead time for imported marble is 3 weeks…"
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          {...register('notes')}
        />
      </section>

      {/* ── Anonymity notice ──────────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Your identity stays anonymous until the customer selects your bid{' '}
          <strong>and makes the initial payment</strong>. The customer sees your BOQ, material
          level, and company profile — never your name or contact details.
        </p>
      </div>

      {/* ── Grand total + submit ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground">Grand Total (from BOQ)</p>
          <p className="font-serif text-2xl font-bold text-accent">
            {grandTotal > 0 ? formatInr(grandTotal) : '—'}
          </p>
        </div>
        <Button
          type="submit"
          disabled={submitMutation.isPending || grandTotal === 0}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {submitMutation.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</>
            : 'Submit Bid'}
        </Button>
      </div>
    </form>
  );
}
