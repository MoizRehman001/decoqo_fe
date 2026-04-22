import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OtpVerifyForm } from '@/components/auth/OtpVerifyForm';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Verify Email — Decoqo',
  description: 'Verify your email address to complete your Decoqo registration.',
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="mx-auto h-14 w-14 rounded-full" />
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
          <div className="flex justify-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-11 rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <OtpVerifyForm />
    </Suspense>
  );
}
