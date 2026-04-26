'use client';

/**
 * Admin Commission Management — 4-tab interface:
 * 1. Policies  2. Per-Vendor Overrides  3. Simulate  4. History
 */

import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Percent, Plus, Pencil, Trash2, Loader2, Play,
  ToggleLeft, ToggleRight, Save, Search, X, CheckCircle2,
  ShieldCheck, User, Copy, History, Settings2, Users,
  ChevronRight, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from 'boneyard-js/react';
import { cn } from '@/lib/utils';
import {
  useCommissionPolicies,
  useCreateCommissionPolicy,
  useUpdateCommissionPolicy,
  useSetCommissionPolicyPriority,
  useToggleCommissionPolicyActive,
  useDeleteCommissionPolicy,
  useDuplicateCommissionPolicy,
  useSimulateCommission,
  useSearchDesigners,
  useVendorOverrides,
  useSetVendorOverride,
  useRemoveVendorOverride,
  useCommissionApplications,
} from '@/lib/api/commission';
import type {
  CommissionPolicy,
  CommissionPolicyType,
  CreateCommissionPolicyDto,
  DesignerSearchResult,
  VendorOverride,
} from '@/lib/api/commission';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const policySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['PROJECT_COUNT', 'TIME_RANGE', 'AMOUNT_RANGE', 'CUSTOM_OVERRIDE']),
  priority: z.coerce.number().int().min(0),
  // Legacy conditions
  projectCountLessThan: z.coerce.number().optional().or(z.literal('')),
  projectCountGreaterThan: z.coerce.number().optional().or(z.literal('')),
  amountLessThan: z.coerce.number().optional().or(z.literal('')),
  amountGreaterThan: z.coerce.number().optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // New condition types
  projectCountRangeMin: z.coerce.number().optional().or(z.literal('')),
  projectCountRangeMax: z.coerce.number().optional().or(z.literal('')),
  ratingAbove: z.coerce.number().optional().or(z.literal('')),
  gmvAbovePaise: z.coerce.number().optional().or(z.literal('')),
  daysSinceJoined: z.coerce.number().optional().or(z.literal('')),
  // Actions
  commissionPercent: z.coerce.number().min(0).max(100),
  platformFeePercent: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  // Applicable
  applicableCities: z.string().optional(),
  applicableStates: z.string().optional(),
});

type PolicyFormValues = z.infer<typeof policySchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<CommissionPolicyType, string> = {
  PROJECT_COUNT: 'Project Count',
  TIME_RANGE: 'Time Range',
  AMOUNT_RANGE: 'Amount Range',
  CUSTOM_OVERRIDE: 'Custom Override',
};

const TYPE_COLORS: Record<CommissionPolicyType, string> = {
  PROJECT_COUNT: 'hsl(217 65% 60%)',
  TIME_RANGE: 'hsl(280 60% 65%)',
  AMOUNT_RANGE: 'hsl(142 71% 45%)',
  CUSTOM_OVERRIDE: 'hsl(40 45% 55%)',
};

function splitCsv(val?: string): string[] {
  if (!val?.trim()) return [];
  return val.split(',').map((s) => s.trim()).filter(Boolean);
}

function joinCsv(arr?: string[]): string {
  return (arr ?? []).join(', ');
}

function formatPaise(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}

/** Render policy conditions as human-readable text */
function conditionsToHuman(policy: CommissionPolicy): string[] {
  const c = policy.conditions;
  const lines: string[] = [];
  if (c.projectCountLessThan !== undefined) lines.push(`First ${c.projectCountLessThan} projects`);
  if (c.projectCountGreaterThan !== undefined) lines.push(`After ${c.projectCountGreaterThan} projects`);
  if (c.projectCountRange) lines.push(`Projects ${c.projectCountRange.min}–${c.projectCountRange.max}`);
  if (c.amountLessThan !== undefined) lines.push(`Amount < ${formatPaise(c.amountLessThan)}`);
  if (c.amountGreaterThan !== undefined) lines.push(`Amount > ${formatPaise(c.amountGreaterThan)}`);
  if (c.startDate && c.endDate) {
    const s = new Date(c.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const e = new Date(c.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    lines.push(`${s} – ${e}`);
  } else if (c.startDate) {
    lines.push(`From ${new Date(c.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`);
  } else if (c.endDate) {
    lines.push(`Until ${new Date(c.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`);
  }
  if (c.ratingAbove) lines.push(`Rating ≥ ${c.ratingAbove.rating}`);
  if (c.gmvAbove) lines.push(`GMV > ${formatPaise(c.gmvAbove.gmvPaise)}`);
  if (c.daysSinceJoined) lines.push(`Within first ${c.daysSinceJoined.days} days`);
  return lines;
}

// ---------------------------------------------------------------------------
// Designer Picker — searchable multi-select by name / email / phone / city
// ---------------------------------------------------------------------------

interface DesignerPickerProps {
  selected: DesignerSearchResult[];
  onChange: (designers: DesignerSearchResult[]) => void;
}

function DesignerPicker({ selected, onChange }: DesignerPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isFetching } = useSearchDesigners(query);

  const isSelected = useCallback(
    (id: string) => selected.some((d) => d.id === id),
    [selected],
  );

  const toggle = (designer: DesignerSearchResult) => {
    if (isSelected(designer.id)) {
      onChange(selected.filter((d) => d.id !== designer.id));
    } else {
      onChange([...selected, designer]);
    }
  };

  const remove = (id: string) => onChange(selected.filter((d) => d.id !== id));

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
            >
              <User className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="max-w-[140px] truncate">{d.displayName}</span>
              <span className="text-accent/60">·</span>
              <span className="text-accent/70 truncate max-w-[80px]">{d.city}</span>
              <button
                type="button"
                onClick={() => remove(d.id)}
                aria-label={`Remove ${d.displayName}`}
                className="ml-0.5 rounded-full hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by name, email, phone, or city…"
          className="pl-8 h-9 text-sm"
          aria-label="Search designers"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown results */}
      {open && query.trim().length >= 1 && (
        <div className="relative z-50">
          <div className="absolute top-0 left-0 right-0 max-h-52 overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
            {results.length === 0 && !isFetching && (
              <p className="px-4 py-3 text-xs text-muted-foreground">No designers found for "{query}"</p>
            )}
            {results.map((designer) => {
              const sel = isSelected(designer.id);
              return (
                <button
                  key={designer.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); toggle(designer); }}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/40',
                    sel && 'bg-accent/5',
                  )}
                >
                  <div className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    sel ? 'border-accent bg-accent' : 'border-border bg-background',
                  )}>
                    {sel && <CheckCircle2 className="h-3 w-3 text-accent-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground truncate">
                        {designer.displayName}
                      </span>
                      {designer.isApproved && (
                        <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" aria-label="KYC Approved" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-xs text-muted-foreground">{designer.businessName}</span>
                      {designer.city && (
                        <span className="text-xs text-muted-foreground">· {designer.city}</span>
                      )}
                      {designer.email && (
                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">· {designer.email}</span>
                      )}
                      {designer.phone && (
                        <span className="text-xs text-muted-foreground">· {designer.phone}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} designer{selected.length !== 1 ? 's' : ''} selected.
          Leave empty to apply to all designers.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Policy Form Dialog
// ---------------------------------------------------------------------------

interface PolicyFormDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: CommissionPolicy;
}

function PolicyFormDialog({ open, onClose, initial }: PolicyFormDialogProps) {
  const createMutation = useCreateCommissionPolicy();
  const updateMutation = useUpdateCommissionPolicy();
  const isEdit = !!initial;

  const [selectedDesigners, setSelectedDesigners] = useState<DesignerSearchResult[]>(() =>
    (initial?.applicableDesignerIds ?? []).map((id) => ({
      id,
      displayName: id.slice(0, 8) + '…',
      businessName: '',
      city: '',
      email: null,
      phone: null,
      kycStatus: 'UNKNOWN',
      isApproved: false,
    })),
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description ?? '',
          type: initial.type,
          priority: initial.priority,
          projectCountLessThan: initial.conditions?.projectCountLessThan ?? '',
          projectCountGreaterThan: initial.conditions?.projectCountGreaterThan ?? '',
          amountLessThan: initial.conditions?.amountLessThan ?? '',
          amountGreaterThan: initial.conditions?.amountGreaterThan ?? '',
          startDate: initial.conditions?.startDate ?? '',
          endDate: initial.conditions?.endDate ?? '',
          projectCountRangeMin: initial.conditions?.projectCountRange?.min ?? '',
          projectCountRangeMax: initial.conditions?.projectCountRange?.max ?? '',
          ratingAbove: initial.conditions?.ratingAbove?.rating ?? '',
          gmvAbovePaise: initial.conditions?.gmvAbove?.gmvPaise ?? '',
          daysSinceJoined: initial.conditions?.daysSinceJoined?.days ?? '',
          commissionPercent: initial.actions?.commissionPercent ?? 0,
          platformFeePercent: initial.actions?.platformFeePercent ?? '',
          applicableCities: joinCsv(initial.applicableCities),
          applicableStates: joinCsv(initial.applicableStates),
        }
      : {
          name: '',
          description: '',
          type: 'PROJECT_COUNT',
          priority: 0,
          commissionPercent: 10,
          platformFeePercent: '',
          applicableCities: '',
          applicableStates: '',
        },
  });

  const [error, setError] = useState<string | null>(null);
  const selectedType = watch('type');
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: PolicyFormValues) => {
    setError(null);

    const projectCountRange =
      values.projectCountRangeMin !== '' && values.projectCountRangeMax !== ''
        ? { min: Number(values.projectCountRangeMin), max: Number(values.projectCountRangeMax) }
        : undefined;

    const dto: CreateCommissionPolicyDto = {
      name: values.name,
      description: values.description || undefined,
      type: values.type,
      priority: values.priority,
      conditions: {
        projectCountLessThan: values.projectCountLessThan !== '' ? Number(values.projectCountLessThan) : undefined,
        projectCountGreaterThan: values.projectCountGreaterThan !== '' ? Number(values.projectCountGreaterThan) : undefined,
        amountLessThan: values.amountLessThan !== '' ? Number(values.amountLessThan) : undefined,
        amountGreaterThan: values.amountGreaterThan !== '' ? Number(values.amountGreaterThan) : undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        projectCountRange,
        ratingAbove: values.ratingAbove !== '' ? { rating: Number(values.ratingAbove) } : undefined,
        gmvAbove: values.gmvAbovePaise !== '' ? { gmvPaise: Number(values.gmvAbovePaise) } : undefined,
        daysSinceJoined: values.daysSinceJoined !== '' ? { days: Number(values.daysSinceJoined) } : undefined,
      },
      actions: {
        commissionPercent: values.commissionPercent,
        platformFeePercent: values.platformFeePercent !== '' ? Number(values.platformFeePercent) : undefined,
      },
      applicableDesignerIds: selectedDesigners.map((d) => d.id),
      applicableCities: splitCsv(values.applicableCities),
      applicableStates: splitCsv(values.applicableStates),
    };

    try {
      if (isEdit && initial) {
        await updateMutation.mutateAsync({ id: initial.id, dto });
      } else {
        await createMutation.mutateAsync(dto);
      }
      reset();
      setSelectedDesigners([]);
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to save policy.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); setSelectedDesigners([]); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {isEdit ? 'Edit Commission Policy' : 'Create Commission Policy'}
          </DialogTitle>
          <DialogDescription>
            Configure the policy conditions and commission actions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input {...register('name')} placeholder="e.g. New Designer Discount" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
            <Input {...register('description')} placeholder="Optional description" />
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Type <span className="text-destructive">*</span>
              </label>
              <select
                {...register('type')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {(['PROJECT_COUNT', 'TIME_RANGE', 'AMOUNT_RANGE', 'CUSTOM_OVERRIDE'] as const).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Priority <span className="text-destructive">*</span>
              </label>
              <Input type="number" min={0} {...register('priority')} placeholder="0" />
              {errors.priority && <p className="mt-1 text-xs text-destructive">{errors.priority.message}</p>}
            </div>
          </div>

          {/* Conditions */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conditions</p>

            {(selectedType === 'PROJECT_COUNT' || selectedType === 'CUSTOM_OVERRIDE') && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Project Count &lt;</label>
                    <Input type="number" min={0} {...register('projectCountLessThan')} placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Project Count &gt;</label>
                    <Input type="number" min={0} {...register('projectCountGreaterThan')} placeholder="e.g. 0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">
                      Project Count Range Min
                      <span className="ml-1 text-muted-foreground font-normal">(inclusive)</span>
                    </label>
                    <Input type="number" min={0} {...register('projectCountRangeMin')} placeholder="e.g. 0" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">
                      Project Count Range Max
                      <span className="ml-1 text-muted-foreground font-normal">(inclusive)</span>
                    </label>
                    <Input type="number" min={0} {...register('projectCountRangeMax')} placeholder="e.g. 3" />
                  </div>
                </div>
              </>
            )}

            {(selectedType === 'AMOUNT_RANGE' || selectedType === 'CUSTOM_OVERRIDE') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Amount &lt; (paise)</label>
                  <Input type="number" min={0} {...register('amountLessThan')} placeholder="e.g. 500000" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Amount &gt; (paise)</label>
                  <Input type="number" min={0} {...register('amountGreaterThan')} placeholder="e.g. 0" />
                </div>
              </div>
            )}

            {(selectedType === 'TIME_RANGE' || selectedType === 'CUSTOM_OVERRIDE') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Start Date</label>
                  <Input type="date" {...register('startDate')} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">End Date</label>
                  <Input type="date" {...register('endDate')} />
                </div>
              </div>
            )}

            {/* Enhanced conditions — always shown */}
            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border/50">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Rating ≥
                  <span className="ml-1 text-muted-foreground font-normal">(0–5)</span>
                </label>
                <Input type="number" min={0} max={5} step={0.1} {...register('ratingAbove')} placeholder="e.g. 4.5" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  GMV &gt; (paise)
                </label>
                <Input type="number" min={0} {...register('gmvAbovePaise')} placeholder="e.g. 5000000" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Days since joined ≤
                </label>
                <Input type="number" min={0} {...register('daysSinceJoined')} placeholder="e.g. 90" />
              </div>
            </div>

            {selectedType === 'CUSTOM_OVERRIDE' && (
              <p className="text-xs text-muted-foreground">All condition fields are optional for Custom Override.</p>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Commission % <span className="text-destructive">*</span>
                </label>
                <Input type="number" min={0} max={100} step={0.01} {...register('commissionPercent')} placeholder="e.g. 10" />
                {errors.commissionPercent && <p className="mt-1 text-xs text-destructive">{errors.commissionPercent.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Platform Fee %</label>
                <Input type="number" min={0} max={100} step={0.01} {...register('platformFeePercent')} placeholder="Optional" />
              </div>
            </div>
          </div>

          {/* Applicable */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scope (optional — leave blank for all)</p>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Specific Designers
                <span className="ml-1 font-normal text-muted-foreground">(search by name, email, phone, or city)</span>
              </label>
              <DesignerPicker
                selected={selectedDesigners}
                onChange={setSelectedDesigners}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Cities (comma-separated)</label>
                <Input {...register('applicableCities')} placeholder="Mumbai, Delhi NCR" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">States (comma-separated)</label>
                <Input {...register('applicableStates')} placeholder="MH, DL" />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); setSelectedDesigners([]); onClose(); }} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------

interface DeleteDialogProps {
  policy: CommissionPolicy;
  onClose: () => void;
}

function DeleteDialog({ policy, onClose }: DeleteDialogProps) {
  const deleteMutation = useDeleteCommissionPolicy();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteMutation.mutateAsync(policy.id);
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to delete policy.');
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Delete Policy?</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{policy.name}</strong>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>Cancel</Button>
          <Button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Inline Priority Editor
// ---------------------------------------------------------------------------

function PriorityEditor({ policy }: { policy: CommissionPolicy }) {
  const setPriority = useSetCommissionPolicyPriority();
  const [value, setValue] = useState(String(policy.priority));
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num === policy.priority) return;
    try {
      await setPriority.mutateAsync({ id: policy.id, priority: num });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      // silently ignore — table will refetch
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-7 w-16 text-xs"
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={setPriority.isPending}
        className={cn('h-7 w-7 p-0', saved && 'text-emerald-600 border-emerald-400/40')}
        aria-label="Save priority"
      >
        {setPriority.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Toggle
// ---------------------------------------------------------------------------

function ActiveToggle({ policy }: { policy: CommissionPolicy }) {
  const toggle = useToggleCommissionPolicyActive();

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync({ id: policy.id, isActive: !policy.isActive });
    } catch {
      // silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={toggle.isPending}
      aria-label={policy.isActive ? 'Deactivate policy' : 'Activate policy'}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all',
        policy.isActive
          ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
      )}
    >
      {toggle.isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : policy.isActive ? (
        <ToggleRight className="h-3.5 w-3.5" />
      ) : (
        <ToggleLeft className="h-3.5 w-3.5" />
      )}
      {policy.isActive ? 'Active' : 'Inactive'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Table Skeleton
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Per-Vendor Overrides
// ---------------------------------------------------------------------------

const overrideSchema = z.object({
  commissionPercent: z.coerce.number().min(0).max(100),
  reason: z.string().min(1, 'Reason is required'),
  expiresAt: z.string().optional(),
});
type OverrideFormValues = z.infer<typeof overrideSchema>;

interface OverrideDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: VendorOverride;
}

function OverrideDialog({ open, onClose, initial }: OverrideDialogProps) {
  const setOverride = useSetVendorOverride();
  const [selectedVendor, setSelectedVendor] = useState<DesignerSearchResult | null>(
    initial ? {
      id: initial.vendorId,
      displayName: initial.vendorName,
      businessName: '',
      city: '',
      email: initial.vendorEmail,
      phone: null,
      kycStatus: '',
      isApproved: false,
    } : null,
  );
  const [vendorQuery, setVendorQuery] = useState('');
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const { data: vendorResults = [], isFetching: searchingVendors } = useSearchDesigners(vendorQuery);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OverrideFormValues>({
    resolver: zodResolver(overrideSchema),
    defaultValues: initial
      ? { commissionPercent: initial.commissionPercent, reason: initial.reason, expiresAt: initial.expiresAt?.slice(0, 10) ?? '' }
      : { commissionPercent: 0, reason: '' },
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: OverrideFormValues) => {
    if (!selectedVendor) { setError('Please select a vendor.'); return; }
    setError(null);
    try {
      await setOverride.mutateAsync({
        vendorId: selectedVendor.id,
        dto: {
          commissionPercent: values.commissionPercent,
          reason: values.reason,
          expiresAt: values.expiresAt || undefined,
        },
      });
      reset();
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to save override.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">{initial ? 'Edit Override' : 'Add Vendor Override'}</DialogTitle>
          <DialogDescription>Set a custom commission rate for a specific vendor. This takes highest priority.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Vendor picker */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Vendor <span className="text-destructive">*</span>
            </label>
            {selectedVendor ? (
              <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{selectedVendor.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedVendor.email ?? selectedVendor.city}</p>
                </div>
                {!initial && (
                  <button type="button" onClick={() => { setSelectedVendor(null); setVendorQuery(''); }} className="text-muted-foreground hover:text-destructive" aria-label="Clear vendor">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={vendorQuery}
                  onChange={(e) => { setVendorQuery(e.target.value); setVendorDropdownOpen(true); }}
                  onFocus={() => setVendorDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setVendorDropdownOpen(false), 150)}
                  placeholder="Search vendor by name, email…"
                  className="pl-8 h-9 text-sm"
                />
                {searchingVendors && <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />}
                {vendorDropdownOpen && vendorQuery.trim().length >= 1 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
                    {vendorResults.length === 0 && !searchingVendors && (
                      <p className="px-3 py-2 text-xs text-muted-foreground">No vendors found</p>
                    )}
                    {vendorResults.map((v) => (
                      <button key={v.id} type="button"
                        onMouseDown={(e) => { e.preventDefault(); setSelectedVendor(v); setVendorQuery(''); setVendorDropdownOpen(false); }}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{v.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{[v.businessName, v.city, v.email].filter(Boolean).join(' · ')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Commission % <span className="text-destructive">*</span></label>
              <Input type="number" min={0} max={100} step={0.01} {...register('commissionPercent')} placeholder="e.g. 0" />
              {errors.commissionPercent && <p className="mt-1 text-xs text-destructive">{errors.commissionPercent.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Expires At</label>
              <Input type="date" {...register('expiresAt')} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Reason <span className="text-destructive">*</span></label>
            <Input {...register('reason')} placeholder="e.g. First 3 projects free promotion" />
            {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }} disabled={setOverride.isPending}>Cancel</Button>
            <Button type="submit" disabled={setOverride.isPending} className="gap-2">
              {setOverride.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {initial ? 'Save Changes' : 'Add Override'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VendorOverridesTab() {
  const { data: overrides = [], isLoading } = useVendorOverrides();
  const removeOverride = useRemoveVendorOverride();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<VendorOverride | null>(null);
  const [removeTarget, setRemoveTarget] = useState<VendorOverride | null>(null);

  const handleRemove = async (override: VendorOverride) => {
    try {
      await removeOverride.mutateAsync(override.vendorId);
      setRemoveTarget(null);
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{overrides.length} active override{overrides.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setShowAdd(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" /> Add Override
        </Button>
      </div>

      <Skeleton name="vendor-overrides" loading={isLoading} animate="shimmer" transition={300} fixture={<TableSkeleton />}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[700px]" aria-label="Vendor Commission Overrides">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Vendor', 'Commission %', 'Reason', 'Expires At', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overrides.map((ov) => {
                const isExpired = ov.expiresAt && new Date() > new Date(ov.expiresAt);
                return (
                  <tr key={ov.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{ov.vendorName}</p>
                      {ov.vendorEmail && <p className="text-xs text-muted-foreground">{ov.vendorEmail}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground tabular-nums">
                      {ov.commissionPercent}%
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">{ov.reason}</td>
                    <td className="px-4 py-3">
                      {ov.expiresAt ? (
                        <span className={cn('text-xs', isExpired ? 'text-destructive' : 'text-muted-foreground')}>
                          {new Date(ov.expiresAt).toLocaleDateString('en-IN')}
                          {isExpired && ' (expired)'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setEditTarget(ov)} className="h-7 gap-1 text-xs">
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setRemoveTarget(ov)} className="h-7 gap-1 text-xs text-destructive hover:border-destructive/40">
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {overrides.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="font-serif text-lg font-semibold text-foreground">No overrides</p>
                    <p className="mt-1 text-sm text-muted-foreground">Add a per-vendor override to give a specific vendor a custom commission rate.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Skeleton>

      <OverrideDialog open={showAdd} onClose={() => setShowAdd(false)} />
      {editTarget && <OverrideDialog open onClose={() => setEditTarget(null)} initial={editTarget} />}

      {/* Remove confirmation */}
      {removeTarget && (
        <Dialog open onOpenChange={(o) => !o && setRemoveTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Remove Override?</DialogTitle>
              <DialogDescription>
                This will remove the commission override for <strong>{removeTarget.vendorName}</strong>. They will revert to standard policy matching.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={removeOverride.isPending}>Cancel</Button>
              <Button onClick={() => handleRemove(removeTarget)} disabled={removeOverride.isPending} className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {removeOverride.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: History
// ---------------------------------------------------------------------------

function HistoryTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading } = useCommissionApplications(page, debouncedSearch || undefined);
  const applications = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    // Simple debounce
    const t = setTimeout(() => setDebouncedSearch(val), 400);
    return () => clearTimeout(t);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by vendor name…"
            className="pl-8 h-9 text-sm"
          />
          {search && (
            <button type="button" onClick={() => handleSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <Skeleton name="commission-history" loading={isLoading} animate="shimmer" transition={300} fixture={<TableSkeleton />}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[800px]" aria-label="Commission Application History">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Date', 'Vendor', 'Project', 'Policy Applied', 'Commission %', 'Amount', 'Type'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{app.vendorName ?? '—'}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{app.vendorId.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{app.projectId.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-sm text-foreground">{app.policyName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground tabular-nums">{app.commissionPercent}%</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground tabular-nums">{formatPaise(app.commissionAmountPaise)}</td>
                  <td className="px-4 py-3">
                    {app.isFallback ? (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600">Fallback</span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600">Policy</span>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <History className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="font-serif text-lg font-semibold text-foreground">No history yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Commission applications will appear here once projects are processed.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="h-7 text-xs">Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-7 text-xs">Next</Button>
            </div>
          </div>
        )}
      </Skeleton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Simulate
// ---------------------------------------------------------------------------

function SimulateSection() {
  const simulate = useSimulateCommission();
  const [selectedDesigner, setSelectedDesigner] = useState<DesignerSearchResult | null>(null);
  const [designerQuery, setDesignerQuery] = useState('');
  const [designerDropdownOpen, setDesignerDropdownOpen] = useState(false);
  const [amountPaise, setAmountPaise] = useState('');
  const [cityId, setCityId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: designerResults = [], isFetching: searchingDesigners } = useSearchDesigners(designerQuery);

  const handleSimulate = async () => {
    if (!selectedDesigner || !amountPaise.trim()) {
      setError('Please select a designer and enter an amount.');
      return;
    }
    setError(null);
    try {
      await simulate.mutateAsync({
        designerId: selectedDesigner.id,
        projectAmountPaise: parseInt(amountPaise, 10),
        cityId: cityId.trim() || undefined,
      });
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Simulation failed.');
    }
  };

  const result = simulate.data;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Play className="h-4 w-4 text-accent" />
        <h2 className="font-serif font-semibold text-foreground">Simulate Commission</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Designer picker */}
        <div className="lg:col-span-1">
          <label className="mb-1 block text-xs font-medium text-foreground">
            Designer <span className="text-destructive">*</span>
          </label>
          {selectedDesigner ? (
            <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{selectedDesigner.displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {selectedDesigner.email ?? selectedDesigner.phone ?? selectedDesigner.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedDesigner(null); setDesignerQuery(''); }}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Clear designer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={designerQuery}
                onChange={(e) => { setDesignerQuery(e.target.value); setDesignerDropdownOpen(true); }}
                onFocus={() => setDesignerDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDesignerDropdownOpen(false), 150)}
                placeholder="Search by name, email, phone…"
                className="h-8 pl-8 text-xs"
              />
              {searchingDesigners && (
                <Loader2 className="absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {designerDropdownOpen && designerQuery.trim().length >= 1 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
                  {designerResults.length === 0 && !searchingDesigners && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">No designers found</p>
                  )}
                  {designerResults.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setSelectedDesigner(d); setDesignerQuery(''); setDesignerDropdownOpen(false); }}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-foreground truncate">{d.displayName}</span>
                          {d.isApproved && <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {[d.businessName, d.city, d.email, d.phone].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Amount (paise) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min={0}
            value={amountPaise}
            onChange={(e) => setAmountPaise(e.target.value)}
            placeholder="e.g. 500000"
            className="h-8 text-xs"
          />
        </div>

        {/* City */}
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">City</label>
          <Input
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            placeholder="Optional"
            className="h-8 text-xs"
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        onClick={handleSimulate}
        disabled={simulate.isPending || !selectedDesigner}
        className="gap-2 h-8 text-xs"
      >
        {simulate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        Run Simulation
      </Button>

      {result && (
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 text-sm">
          <p className="font-semibold text-foreground">Simulation Result</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Designer</p>
              <p className="font-medium text-foreground">{selectedDesigner?.displayName ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Matched Policy</p>
              <p className="font-medium text-foreground">
                {(result as { matchedPolicyName?: string }).matchedPolicyName ?? 'Default / None'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Commission %</p>
              <p className="font-medium text-foreground">{result.commissionPercent ?? 0}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Platform Fee %</p>
              <p className="font-medium text-foreground">{result.platformFeePercent ?? 2}%</p>
            </div>
            {result.commissionAmountPaise != null && result.commissionAmountPaise > 0 && (
              <div>
                <p className="text-muted-foreground">Commission Amount</p>
                <p className="font-medium text-foreground">{formatPaise(result.commissionAmountPaise)}</p>
              </div>
            )}
            {(result as { isFallback?: boolean }).isFallback && (
              <div>
                <p className="text-muted-foreground">Type</p>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600">Fallback</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1: Policies (enhanced)
// ---------------------------------------------------------------------------

function PoliciesTab() {
  const { data: result, isLoading } = useCommissionPolicies();
  const policies: CommissionPolicy[] = result?.data ?? (Array.isArray(result) ? (result as CommissionPolicy[]) : []);
  const duplicateMutation = useDuplicateCommissionPolicy();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<CommissionPolicy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommissionPolicy | null>(null);
  const [tooltipPolicy, setTooltipPolicy] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{policies.length} polic{policies.length !== 1 ? 'ies' : 'y'} configured.</p>
        <Button onClick={() => setShowCreate(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" /> New Policy
        </Button>
      </div>

      <Skeleton name="admin-commission-policies" loading={isLoading} animate="shimmer" transition={300} fixture={<TableSkeleton />}>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[900px]" aria-label="Commission Policies">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Name', 'Type', 'Scope', 'Priority', 'Commission %', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => {
                const typeColor = TYPE_COLORS[policy.type] ?? 'hsl(0 0% 50%)';
                const humanConditions = conditionsToHuman(policy);
                const scopeParts: string[] = [];
                if (policy.applicableDesignerIds?.length) scopeParts.push(`${policy.applicableDesignerIds.length} designer${policy.applicableDesignerIds.length !== 1 ? 's' : ''}`);
                if (policy.applicableCities?.length) scopeParts.push(`${policy.applicableCities.length} cit${policy.applicableCities.length !== 1 ? 'ies' : 'y'}`);
                const scopeLabel = scopeParts.length > 0 ? scopeParts.join(', ') : 'All';

                return (
                  <tr key={policy.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{policy.name ?? '—'}</p>
                          {policy.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{policy.description}</p>
                          )}
                          {humanConditions.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {humanConditions.map((c, i) => (
                                <span key={i} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{c}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setTooltipPolicy(tooltipPolicy === policy.id ? null : policy.id)}
                          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label="Show conditions"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {tooltipPolicy === policy.id && humanConditions.length > 0 && (
                        <div className="mt-2 rounded-lg border border-border bg-background p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">Conditions:</p>
                          {humanConditions.map((c, i) => (
                            <p key={i} className="text-muted-foreground flex items-center gap-1">
                              <ChevronRight className="h-3 w-3 shrink-0" />{c}: {policy.actions.commissionPercent}% commission
                            </p>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${typeColor}15`, color: typeColor }}>
                        {TYPE_LABELS[policy.type] ?? policy.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{scopeLabel}</td>
                    <td className="px-4 py-3"><PriorityEditor policy={policy} /></td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground tabular-nums">{policy.actions?.commissionPercent ?? 0}%</td>
                    <td className="px-4 py-3"><ActiveToggle policy={policy} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setEditTarget(policy)} className="h-7 gap-1 text-xs">
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          onClick={() => duplicateMutation.mutate(policy)}
                          disabled={duplicateMutation.isPending}
                          className="h-7 gap-1 text-xs"
                          aria-label="Duplicate policy"
                        >
                          {duplicateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteTarget(policy)} className="h-7 gap-1 text-xs text-destructive hover:border-destructive/40">
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {policies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <Percent className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="font-serif text-lg font-semibold text-foreground">No policies yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Create your first commission policy to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Skeleton>

      <PolicyFormDialog open={showCreate} onClose={() => setShowCreate(false)} />
      {editTarget && <PolicyFormDialog open onClose={() => setEditTarget(null)} initial={editTarget} />}
      {deleteTarget && <DeleteDialog policy={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type TabId = 'policies' | 'overrides' | 'simulate' | 'history';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'policies', label: 'Policies', icon: <Settings2 className="h-4 w-4" /> },
  { id: 'overrides', label: 'Per-Vendor Overrides', icon: <Users className="h-4 w-4" /> },
  { id: 'simulate', label: 'Simulate', icon: <Play className="h-4 w-4" /> },
  { id: 'history', label: 'History', icon: <History className="h-4 w-4" /> },
];

export default function AdminCommissionPage() {
  const [activeTab, setActiveTab] = useState<TabId>('policies');

  return (
    <div className="space-y-6 animate-page-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Commission Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage commission policies, vendor overrides, simulate rates, and view history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1" role="tablist" aria-label="Commission tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'policies' && <PoliciesTab />}
        {activeTab === 'overrides' && <VendorOverridesTab />}
        {activeTab === 'simulate' && <SimulateSection />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}
