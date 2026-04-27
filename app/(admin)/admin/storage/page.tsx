'use client';

/**
 * Admin Storage Settings — multi-provider file storage management.
 * Supports AWS S3, Cloudflare R2, and Local VM storage.
 * All config is DB-driven — no redeploy required.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  HardDrive, Cloud, Server, Save, Loader2,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from 'boneyard-js/react';
import { cn } from '@/lib/utils';
import { useStorageSettings, useUpdateStorageSettings } from '@/lib/api/storage';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  enableS3: z.boolean(),
  enableR2: z.boolean(),
  enableLocal: z.boolean(),
  uploadMode: z.enum(['VM_THEN_CLOUD', 'DIRECT_CLOUD', 'VM_ONLY']),
  maxFileSizeValue: z.coerce.number().positive('Must be > 0'),
  maxFileSizeUnit: z.enum(['KB', 'MB', 'GB']),
  deleteAfterUpload: z.boolean(),
  // S3
  s3Region: z.string().optional(),
  s3AccessKeyId: z.string().optional(),
  s3SecretAccessKey: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3PublicUrlBase: z.string().optional(),
  // R2
  r2AccountId: z.string().optional(),
  r2AccessKeyId: z.string().optional(),
  r2SecretAccessKey: z.string().optional(),
  r2Bucket: z.string().optional(),
  r2PublicUrlBase: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bytesToUnit(bytes: number): { value: number; unit: 'KB' | 'MB' | 'GB' } {
  if (bytes >= 1024 * 1024 * 1024) return { value: bytes / (1024 * 1024 * 1024), unit: 'GB' };
  if (bytes >= 1024 * 1024) return { value: bytes / (1024 * 1024), unit: 'MB' };
  return { value: bytes / 1024, unit: 'KB' };
}

function unitToBytes(value: number, unit: 'KB' | 'MB' | 'GB'): number {
  if (unit === 'GB') return Math.round(value * 1024 * 1024 * 1024);
  if (unit === 'MB') return Math.round(value * 1024 * 1024);
  return Math.round(value * 1024);
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

function Toggle({ checked, onChange, label, description, disabled }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
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
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          checked ? 'bg-accent' : 'bg-muted',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg',
          'transform transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({ title, icon: Icon, children, collapsible = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between px-5 py-4',
          collapsible && 'cursor-pointer hover:bg-muted/10',
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="font-serif font-semibold text-foreground">{title}</h2>
        </div>
        {collapsible && (open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />)}
      </button>
      {(!collapsible || open) && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Secret input
// ---------------------------------------------------------------------------

function SecretInput({ label, placeholder, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <Input type={show ? 'text' : 'password'} placeholder={placeholder} className="pr-9 text-sm" {...props} />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? 'Hide' : 'Show'}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminStoragePage() {
  const { data: settings, isLoading } = useStorageSettings();
  const updateMutation = useUpdateStorageSettings();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      enableS3: false,
      enableR2: true,
      enableLocal: false,
      uploadMode: 'VM_THEN_CLOUD',
      maxFileSizeValue: 10,
      maxFileSizeUnit: 'MB',
      deleteAfterUpload: true,
    },
  });

  // Populate form from API
  useEffect(() => {
    if (!settings) return;
    const { value, unit } = bytesToUnit(settings.maxFileSizeBytes ?? 10 * 1024 * 1024);
    reset({
      enableS3: settings.enableS3,
      enableR2: settings.enableR2,
      enableLocal: settings.enableLocal,
      uploadMode: settings.uploadMode,
      maxFileSizeValue: parseFloat(value.toFixed(2)),
      maxFileSizeUnit: unit,
      deleteAfterUpload: settings.deleteAfterUpload,
      s3Region: settings.s3Config?.region ?? '',
      s3AccessKeyId: settings.s3Config?.accessKeyId === '***' ? '' : (settings.s3Config?.accessKeyId ?? ''),
      s3SecretAccessKey: '',
      s3Bucket: settings.s3Config?.bucket ?? '',
      s3PublicUrlBase: settings.s3Config?.publicUrlBase ?? '',
      r2AccountId: settings.r2Config?.accountId ?? '',
      r2AccessKeyId: settings.r2Config?.accessKeyId === '***' ? '' : (settings.r2Config?.accessKeyId ?? ''),
      r2SecretAccessKey: '',
      r2Bucket: settings.r2Config?.bucket ?? '',
      r2PublicUrlBase: settings.r2Config?.publicUrlBase ?? '',
    });
  }, [settings, reset]);

  const watchedValues = watch();

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSaved(false);
    try {
      const maxFileSizeBytes = unitToBytes(values.maxFileSizeValue, values.maxFileSizeUnit);

      const dto: Record<string, unknown> = {
        enableS3: values.enableS3,
        enableR2: values.enableR2,
        enableLocal: values.enableLocal,
        uploadMode: values.uploadMode,
        maxFileSizeBytes,
        deleteAfterUpload: values.deleteAfterUpload,
      };

      if (values.enableS3) {
        dto.s3Config = {
          region: values.s3Region,
          accessKeyId: values.s3AccessKeyId,
          secretAccessKey: values.s3SecretAccessKey,
          bucket: values.s3Bucket,
          publicUrlBase: values.s3PublicUrlBase,
        };
      }

      if (values.enableR2) {
        dto.r2Config = {
          accountId: values.r2AccountId,
          accessKeyId: values.r2AccessKeyId,
          secretAccessKey: values.r2SecretAccessKey,
          bucket: values.r2Bucket,
          publicUrlBase: values.r2PublicUrlBase,
        };
      }

      await updateMutation.mutateAsync(dto as never);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to save settings.');
    }
  };

  const noProviderEnabled = !watchedValues.enableS3 && !watchedValues.enableR2 && !watchedValues.enableLocal;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Storage Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure file storage providers. Changes take effect immediately — no redeploy required.
          {settings?.updatedAt && (
            <span className="ml-2 text-muted-foreground/60">
              Last updated {new Date(settings.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </p>
      </div>

      <Skeleton name="storage-settings" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      }>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Provider toggles */}
          <Section title="Storage Providers" icon={Cloud}>
            <Toggle
              checked={watchedValues.enableR2}
              onChange={(v) => setValue('enableR2', v)}
              label="Cloudflare R2"
              description="S3-compatible object storage — recommended for production"
            />
            <Toggle
              checked={watchedValues.enableS3}
              onChange={(v) => setValue('enableS3', v)}
              label="AWS S3"
              description="Amazon Simple Storage Service"
            />
            <Toggle
              checked={watchedValues.enableLocal}
              onChange={(v) => setValue('enableLocal', v)}
              label="Local VM Storage"
              description="Store files on this server's filesystem"
            />
            {noProviderEnabled && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs text-destructive">At least one provider must be enabled. Uploads will fail.</p>
              </div>
            )}
          </Section>

          {/* Upload mode */}
          <Section title="Upload Mode" icon={Server}>
            <div className="space-y-2">
              {([
                { value: 'VM_THEN_CLOUD', label: 'VM → Cloud (recommended)', desc: 'Write to server temp storage first, then upload to all enabled cloud providers. Falls back to local if cloud fails.' },
                { value: 'DIRECT_CLOUD', label: 'Direct Cloud', desc: 'Upload directly to cloud providers. Faster but no local fallback.' },
                { value: 'VM_ONLY', label: 'VM Only', desc: 'Store files only on this server. No cloud upload.' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('uploadMode', opt.value)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
                    watchedValues.uploadMode === opt.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:bg-muted/20',
                  )}
                >
                  <div className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2',
                    watchedValues.uploadMode === opt.value ? 'border-accent bg-accent' : 'border-border',
                  )} />
                  <div>
                    <p className={cn('text-sm font-medium', watchedValues.uploadMode === opt.value ? 'text-accent' : 'text-foreground')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <Toggle
              checked={watchedValues.deleteAfterUpload}
              onChange={(v) => setValue('deleteAfterUpload', v)}
              label="Delete temp file after cloud upload"
              description="Remove the VM temp copy once cloud upload succeeds"
            />
          </Section>

          {/* File size limit */}
          <Section title="File Size Limit" icon={HardDrive}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Maximum file size</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  step={0.1}
                  className="flex-1"
                  {...register('maxFileSizeValue')}
                />
                <select
                  {...register('maxFileSizeUnit')}
                  className="w-20 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
              {errors.maxFileSizeValue && (
                <p className="mt-1 text-xs text-destructive">{errors.maxFileSizeValue.message}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                = {unitToBytes(watchedValues.maxFileSizeValue || 0, watchedValues.maxFileSizeUnit).toLocaleString()} bytes
              </p>
            </div>
          </Section>

          {/* R2 Config */}
          {watchedValues.enableR2 && (
            <Section title="Cloudflare R2 Configuration" icon={Cloud} collapsible>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Account ID</label>
                  <Input {...register('r2AccountId')} placeholder="e13d18caee875b15f91883fe75414b57" className="text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Bucket Name</label>
                  <Input {...register('r2Bucket')} placeholder="my-bucket" className="text-sm" />
                </div>
                <SecretInput label="Access Key ID" placeholder="Leave blank to keep existing" {...register('r2AccessKeyId')} />
                <SecretInput label="Secret Access Key" placeholder="Leave blank to keep existing" {...register('r2SecretAccessKey')} />
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">Public URL Base (optional)</label>
                  <Input {...register('r2PublicUrlBase')} placeholder="https://pub-xxx.r2.dev" className="text-sm" />
                </div>
              </div>
            </Section>
          )}

          {/* S3 Config */}
          {watchedValues.enableS3 && (
            <Section title="AWS S3 Configuration" icon={Cloud} collapsible>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Region</label>
                  <Input {...register('s3Region')} placeholder="ap-south-1" className="text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Bucket Name</label>
                  <Input {...register('s3Bucket')} placeholder="my-s3-bucket" className="text-sm" />
                </div>
                <SecretInput label="Access Key ID" placeholder="Leave blank to keep existing" {...register('s3AccessKeyId')} />
                <SecretInput label="Secret Access Key" placeholder="Leave blank to keep existing" {...register('s3SecretAccessKey')} />
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">Public URL Base (optional)</label>
                  <Input {...register('s3PublicUrlBase')} placeholder="https://cdn.example.com" className="text-sm" />
                </div>
              </div>
            </Section>
          )}

          {/* Error / success */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Save */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={updateMutation.isPending || noProviderEnabled}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {updateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved!</>
              ) : (
                <><Save className="h-4 w-4" /> Save Settings</>
              )}
            </Button>
            {saved && <span className="text-sm text-emerald-600 font-medium">Settings updated successfully.</span>}
          </div>
        </form>
      </Skeleton>
    </div>
  );
}
