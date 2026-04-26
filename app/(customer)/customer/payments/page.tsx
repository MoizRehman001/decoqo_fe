'use client';

/**
 * Customer payments overview page.
 * Route: /customer/payments
 * Shows payment history across all projects.
 */

import { CreditCard } from 'lucide-react';
import { useProjects } from '@/lib/api/projects';
import { useAuthStore } from '@/lib/stores/auth.store';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { Skeleton } from 'boneyard-js/react';

export default function CustomerPaymentsPage() {
  const { user } = useAuthStore();
  const { data: projects, isLoading } = useProjects(user?.id ?? '');

  // Show payment history for the first active project with a BOQ
  // In production this would be a dedicated payments endpoint
  const activeProject = projects?.find(
    (p) => p.status === 'IN_PROGRESS' || p.status === 'VENDOR_SELECTED',
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escrow transactions and payment history across your projects
        </p>
      </div>

      <Skeleton name="customer-payments" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        {activeProject ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {activeProject.title}
              </h2>
            </div>
            <PaymentHistory projectId={activeProject.id} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-serif text-lg font-semibold text-foreground">No payments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Payment history will appear here once your projects are in progress.
            </p>
          </div>
        )}
      </Skeleton>
    </div>
  );
}
