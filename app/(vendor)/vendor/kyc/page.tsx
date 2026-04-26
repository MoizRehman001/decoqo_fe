'use client';

/**
 * Vendor KYC Submission Form — real API.
 * Uses /vendors/kyc/status to check existing status and /vendors/kyc to submit.
 * Documents uploaded via S3 presigned URLs before submission.
 */

import { useState } from 'react';
import {
  Shield, Upload, CheckCircle2, Loader2, FileText,
  AlertCircle, X, BadgeCheck,
} from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useVendorKycStatus, useSubmitKyc } from '@/lib/api/users';
import { useUploadKycDocument } from '@/lib/api/uploads';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocUploadItem {
  type: 'AADHAAR' | 'PAN' | 'GST' | 'BANK_STATEMENT' | 'PORTFOLIO';
  label: string;
  required: boolean;
  file: File | null;
  uploadedUrl: string | null;
  status: 'idle' | 'uploading' | 'done' | 'error';
}

const REQUIRED_DOCS: Omit<DocUploadItem, 'file' | 'uploadedUrl' | 'status'>[] = [
  { type: 'AADHAAR',        label: 'Aadhaar Card',              required: true  },
  { type: 'PAN',            label: 'PAN Card',                  required: true  },
  { type: 'GST',            label: 'GST Certificate',           required: false },
  { type: 'BANK_STATEMENT', label: 'Bank Statement (6 months)', required: true  },
  { type: 'PORTFOLIO',      label: 'Portfolio / Work Samples',  required: false },
];

// ---------------------------------------------------------------------------
// Skeleton fixture
// ---------------------------------------------------------------------------

function KycFixture() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-20 rounded-xl bg-muted" />
      <div className="rounded-2xl border border-border p-5 space-y-4">
        <div className="h-5 w-32 rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VendorKycPage() {
  const { user } = useAuthStore();

  // Real API — fetch existing KYC status
  const { data: kycStatus, isLoading: statusLoading } = useVendorKycStatus();
  const submitKyc = useSubmitKyc();
  const uploadDoc = useUploadKycDocument();

  const [docs, setDocs] = useState<DocUploadItem[]>(
    REQUIRED_DOCS.map((d) => ({ ...d, file: null, uploadedUrl: null, status: 'idle' })),
  );
  const [panNumber, setPanNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (type: DocUploadItem['type'], file: File | null) => {
    setDocs((prev) =>
      prev.map((d) => (d.type === type ? { ...d, file, uploadedUrl: null, status: 'idle' } : d)),
    );
  };

  const requiredDone = docs.filter((d) => d.required).every((d) => d.file !== null);
  const isSubmitting = uploadDoc.isPending || submitKyc.isPending;

  const handleSubmit = async () => {
    if (!requiredDone) { setError('Please upload all required documents.'); return; }
    if (!panNumber.trim()) { setError('PAN number is required.'); return; }
    if (!bankAccount.trim()) { setError('Bank account number is required.'); return; }
    if (!bankIfsc.trim()) { setError('Bank IFSC code is required.'); return; }
    setError(null);

    try {
      // Upload each file to S3 and collect URLs
      const uploadedUrls: Partial<Record<DocUploadItem['type'], string>> = {};
      for (const doc of docs) {
        if (!doc.file) continue;
        setDocs((prev) => prev.map((d) => d.type === doc.type ? { ...d, status: 'uploading' } : d));
        const url = await uploadDoc.mutateAsync({
          file: doc.file,
          vendorId: user?.id ?? '',
        });
        uploadedUrls[doc.type] = url;
        setDocs((prev) => prev.map((d) => d.type === doc.type ? { ...d, uploadedUrl: url, status: 'done' } : d));
      }

      // Submit KYC with uploaded URLs
      await submitKyc.mutateAsync({
        panNumber: panNumber.trim(),
        bankAccountNumber: bankAccount.trim(),
        bankIfsc: bankIfsc.trim(),
        businessProofUrl: uploadedUrls['GST'] ?? uploadedUrls['PORTFOLIO'],
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? 'Failed to submit KYC. Please try again.');
      // Reset uploading states
      setDocs((prev) => prev.map((d) => d.status === 'uploading' ? { ...d, status: 'error' } : d));
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (statusLoading) {
    return (
      <Skeleton name="vendor-kyc" loading animate="shimmer" fixture={<KycFixture />}>
        <div />
      </Skeleton>
    );
  }

  // ── Already submitted / status exists ─────────────────────────────────────
  const existingStatus = (kycStatus as { kycStatus?: string } | null)?.kycStatus;
  if (existingStatus && existingStatus !== 'NOT_STARTED' || submitted) {
    const status = submitted ? 'PENDING' : (existingStatus ?? 'PENDING');
    const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
      PENDING:           { icon: Shield,      color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/20',     label: 'Under Review' },
      APPROVED:          { icon: BadgeCheck,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Approved' },
      REJECTED:          { icon: AlertCircle, color: 'text-destructive',                       bg: 'bg-destructive/10',                    label: 'Rejected' },
      RESUBMIT_REQUIRED: { icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/20',     label: 'Resubmission Required' },
    };
    const cfg = statusConfig[status] ?? statusConfig['PENDING']!;
    const StatusIcon = cfg.icon;

    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-page-in">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">KYC Verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your identity verification status</p>
        </div>

        <div className={cn('rounded-2xl border p-8 text-center space-y-4', cfg.bg)}>
          <StatusIcon className={cn('mx-auto h-14 w-14', cfg.color)} />
          <div>
            <h2 className={cn('font-serif text-2xl font-bold', cfg.color)}>{cfg.label}</h2>
            {status === 'PENDING' && (
              <p className="mt-2 text-sm text-muted-foreground">
                Your KYC application is being reviewed. This typically takes 1–2 business days.
              </p>
            )}
            {status === 'APPROVED' && (
              <p className="mt-2 text-sm text-muted-foreground">
                Your identity has been verified. You can now bid on projects.
              </p>
            )}
            {status === 'RESUBMIT_REQUIRED' && (
              <p className="mt-2 text-sm text-muted-foreground">
                Please resubmit your KYC documents with the corrections requested by the admin.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Submission form ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">KYC Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your identity verification to start bidding on projects.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="text-sm">
          <p className="font-semibold text-blue-700 dark:text-blue-300">Why KYC?</p>
          <p className="mt-0.5 text-blue-600 dark:text-blue-400">
            Decoqo verifies all vendors to ensure customer trust and platform safety.
            Verification typically takes 1–2 business days.
          </p>
        </div>
      </div>

      {/* Bank & PAN details */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-serif font-semibold text-foreground">Financial Details</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="pan" className="mb-1 block text-sm font-medium text-foreground">
              PAN Number <span className="text-destructive">*</span>
            </label>
            <input
              id="pan"
              type="text"
              placeholder="ABCDE1234F"
              maxLength={10}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <label htmlFor="bank" className="mb-1 block text-sm font-medium text-foreground">
              Bank Account Number <span className="text-destructive">*</span>
            </label>
            <input
              id="bank"
              type="text"
              placeholder="1234567890"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <label htmlFor="ifsc" className="mb-1 block text-sm font-medium text-foreground">
              IFSC Code <span className="text-destructive">*</span>
            </label>
            <input
              id="ifsc"
              type="text"
              placeholder="SBIN0001234"
              maxLength={11}
              value={bankIfsc}
              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      </div>

      {/* Document uploads */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-serif font-semibold text-foreground">Upload Documents</h2>
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.type} className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">{doc.label}</span>
                  {doc.required && <span className="text-xs text-destructive">*</span>}
                </div>
                {doc.file && doc.status !== 'uploading' && (
                  <button
                    type="button"
                    onClick={() => handleFileChange(doc.type, null)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {doc.status === 'uploading' ? (
                <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-sm text-accent">Uploading…</span>
                </div>
              ) : doc.status === 'done' ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="truncate text-sm text-emerald-700 dark:text-emerald-300">{doc.file?.name}</span>
                </div>
              ) : doc.file ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="truncate text-sm text-emerald-700 dark:text-emerald-300">{doc.file.name}</span>
                  <span className="shrink-0 text-xs text-emerald-600/60">
                    {(doc.file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ) : (
                <label className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-3 py-3 transition-colors',
                  'border-border hover:border-accent/50 hover:bg-accent/5',
                )}>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload PDF, JPG, or PNG (max 5 MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileChange(doc.type, e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Required documents</span>
          <span className={cn('font-medium', requiredDone ? 'text-emerald-500' : 'text-foreground')}>
            {docs.filter((d) => d.required && d.file).length} / {docs.filter((d) => d.required).length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{
              width: `${(docs.filter((d) => d.required && d.file).length / docs.filter((d) => d.required).length) * 100}%`,
            }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!requiredDone || isSubmitting}
        className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting KYC…</>
        ) : (
          <><Shield className="h-4 w-4" /> Submit KYC Application</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your documents are encrypted and stored securely. Only Decoqo admin can view them.
      </p>
    </div>
  );
}
