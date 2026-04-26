'use client';

/**
 * Admin BOQ PDF Settings — configure watermark and display options for BOQ PDFs.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from 'boneyard-js/react';
import { cn } from '@/lib/utils';
import { useBoqPdfSettings, useUpdateBoqPdfSettings } from '@/lib/api/commission';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const settingsSchema = z.object({
  watermarkText: z.string().min(1, 'Watermark text is required'),
  watermarkOpacity: z.coerce.number().min(0).max(1),
  watermarkAngle: z.coerce.number().min(-180).max(180),
  showClientName: z.boolean(),
  showTimestamp: z.boolean(),
  isActive: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// ---------------------------------------------------------------------------
// Watermark Preview
// ---------------------------------------------------------------------------

interface WatermarkPreviewProps {
  text: string;
  opacity: number;
  angle: number;
}

function WatermarkPreview({ text, opacity, angle }: WatermarkPreviewProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-white"
      style={{ minHeight: 280 }}
      aria-label="Watermark preview"
    >
      {/* Mock document content */}
      <div className="p-6 space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
        <div className="h-3 w-4/6 rounded bg-gray-100" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-gray-100" />
          ))}
        </div>
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-3/4 rounded bg-gray-100" />
      </div>

      {/* Watermark overlay */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span
          className="select-none whitespace-nowrap font-bold text-gray-400"
          style={{
            opacity,
            transform: `rotate(${angle}deg)`,
            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
            letterSpacing: '0.05em',
          }}
        >
          {text || 'WATERMARK'}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          checked ? 'bg-accent' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg',
            'transform transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider Field
// ---------------------------------------------------------------------------

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: string;
  onChange: (val: number) => void;
}

function SliderField({ label, value, min, max, step = 0.01, displayValue, onChange }: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
        aria-label={label}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Skeleton
// ---------------------------------------------------------------------------

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminBoqSettingsPage() {
  const { data: settings, isLoading } = useBoqPdfSettings();
  const updateMutation = useUpdateBoqPdfSettings();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      watermarkText: '',
      watermarkOpacity: 0.15,
      watermarkAngle: -30,
      showClientName: true,
      showTimestamp: true,
      isActive: true,
    },
  });

  // Populate form once settings load
  useEffect(() => {
    if (settings) {
      reset({
        watermarkText: settings.watermarkText ?? '',
        watermarkOpacity: settings.watermarkOpacity ?? 0.15,
        watermarkAngle: settings.watermarkAngle ?? -30,
        showClientName: settings.showClientName ?? true,
        showTimestamp: settings.showTimestamp ?? true,
        isActive: settings.isActive ?? true,
      });
    }
  }, [settings, reset]);

  const watchedText = watch('watermarkText');
  const watchedOpacity = watch('watermarkOpacity');
  const watchedAngle = watch('watermarkAngle');
  const watchedShowClientName = watch('showClientName');
  const watchedShowTimestamp = watch('showTimestamp');
  const watchedIsActive = watch('isActive');

  const onSubmit = async (values: SettingsFormValues) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6 animate-page-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">BOQ PDF Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure watermark and display options for generated BOQ PDFs.
          {settings?.updatedAt && (
            <span className="ml-2 text-muted-foreground/60">
              Last updated {new Date(settings.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </p>
      </div>

      <Skeleton
        name="admin-boq-settings"
        loading={isLoading}
        animate="shimmer"
        transition={300}
        fixture={<SettingsSkeleton />}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Settings Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Watermark Text */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Watermark Text <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('watermarkText')}
                placeholder="e.g. CONFIDENTIAL"
              />
              {errors.watermarkText && (
                <p className="mt-1 text-xs text-destructive">{errors.watermarkText.message}</p>
              )}
            </div>

            {/* Opacity Slider */}
            <SliderField
              label="Watermark Opacity"
              value={watchedOpacity}
              min={0}
              max={1}
              step={0.01}
              displayValue={`${Math.round(watchedOpacity * 100)}%`}
              onChange={(val) => setValue('watermarkOpacity', val, { shouldDirty: true })}
            />

            {/* Angle Slider */}
            <SliderField
              label="Watermark Angle"
              value={watchedAngle}
              min={-180}
              max={180}
              step={1}
              displayValue={`${watchedAngle}°`}
              onChange={(val) => setValue('watermarkAngle', val, { shouldDirty: true })}
            />

            {/* Toggles */}
            <ToggleSwitch
              checked={watchedShowClientName}
              onChange={(val) => setValue('showClientName', val, { shouldDirty: true })}
              label="Show Client Name"
              description="Display the client's name on the PDF"
            />

            <ToggleSwitch
              checked={watchedShowTimestamp}
              onChange={(val) => setValue('showTimestamp', val, { shouldDirty: true })}
              label="Show Timestamp"
              description="Display generation date and time on the PDF"
            />

            <ToggleSwitch
              checked={watchedIsActive}
              onChange={(val) => setValue('isActive', val, { shouldDirty: true })}
              label="Watermark Active"
              description="Apply watermark to all generated BOQ PDFs"
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={updateMutation.isPending || !isDirty}
                className="gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saved ? 'Saved!' : 'Save Settings'}
              </Button>
              {saved && (
                <span className="text-sm text-emerald-600 font-medium">
                  Settings updated successfully.
                </span>
              )}
            </div>
          </form>

          {/* Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <h2 className="font-serif font-semibold text-foreground">Live Preview</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a CSS-based approximation of how the watermark will appear on the PDF.
            </p>
            <WatermarkPreview
              text={watchedText}
              opacity={watchedIsActive ? watchedOpacity : 0}
              angle={watchedAngle}
            />
            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
                <p className="text-muted-foreground">Client Name</p>
                <p className={cn('font-medium', watchedShowClientName ? 'text-emerald-600' : 'text-muted-foreground')}>
                  {watchedShowClientName ? 'Shown' : 'Hidden'}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
                <p className="text-muted-foreground">Timestamp</p>
                <p className={cn('font-medium', watchedShowTimestamp ? 'text-emerald-600' : 'text-muted-foreground')}>
                  {watchedShowTimestamp ? 'Shown' : 'Hidden'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Skeleton>
    </div>
  );
}
