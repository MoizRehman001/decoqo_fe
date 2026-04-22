'use client';

import { BadgeCheck, Clock, AlertCircle, Upload } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function VendorKycPage() {
  const { user } = useAuthStore();
  const isVerified = user?.isVerified ?? false;

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">KYC & Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your verification to start bidding on projects.
        </p>
      </div>

      {/* Status banner */}
      <div
        className={`flex items-center gap-3 rounded-2xl border p-4 ${
          isVerified
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
            : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
        }`}
      >
        {isVerified ? (
          <BadgeCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
        )}
        <div>
          <p className={`font-semibold text-sm ${isVerified ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {isVerified ? 'KYC Verified' : 'KYC Pending Review'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isVerified
              ? 'Your account is fully verified. You can bid on all projects.'
              : 'Your documents are under review. This usually takes 1–2 business days.'}
          </p>
        </div>
      </div>

      {/* KYC checklist */}
      <div className="neu-card-3d rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">Verification Checklist</h2>
        {[
          { label: 'PAN Number', done: true },
          { label: 'Bank Account + IFSC', done: true },
          { label: 'Business Proof (GST / Registration)', done: isVerified },
          { label: 'Portfolio (min. 3 photos)', done: isVerified },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
            {item.done ? (
              <BadgeCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            )}
            <span className="text-sm text-foreground">{item.label}</span>
            <span className={`ml-auto text-xs font-medium ${item.done ? 'text-emerald-500' : 'text-amber-500'}`}>
              {item.done ? 'Complete' : 'Pending'}
            </span>
          </div>
        ))}
      </div>

      {/* Upload section */}
      {!isVerified && (
        <div className="ivory-card rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Upload Documents</h2>
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG up to 5MB each</p>
          </div>
        </div>
      )}
    </div>
  );
}
