'use client';

/**
 * Customer BOQ review page — read-only view with approve/request changes.
 * Route: /customer/projects/[projectId]/boq
 */

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, History, CreditCard } from 'lucide-react';
import { BoqReview } from '@/components/boq/BoqReview';
import { VariationsPanel } from '@/components/boq/VariationsPanel';
import { BoqVersionHistory } from '@/components/boq/BoqVersionHistory';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { useBoq } from '@/lib/api/boq';
import { useProject } from '@/lib/api/projects';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function CustomerBoqPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);
  const { data: boq } = useBoq(projectId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/customer/projects"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Projects
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-foreground font-medium truncate">
          {project?.title ?? 'Loading…'}
        </span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-accent font-medium">BOQ</span>
      </div>

      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Bill of Quantities
        </h1>
        {project && (
          <p className="mt-1 text-sm text-muted-foreground">
            {project.title} · {project.city}
          </p>
        )}
      </div>

      {/* BOQ Review */}
      <BoqReview projectId={projectId} />

      {/* Variations — only when BOQ exists and has variations */}
      {boq && boq.variations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pt-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Variation Orders</h2>
          </div>
          <VariationsPanel boq={boq} projectId={projectId} viewerRole="CUSTOMER" />
        </div>
      )}

      {/* Version history */}
      {boq && boq.versions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pt-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Version History</h2>
          </div>
          <BoqVersionHistory versions={boq.versions} />
        </div>
      )}

      {/* Payment history */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 pt-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-serif text-lg font-semibold text-foreground">Payment History</h2>
        </div>
        <PaymentHistory projectId={projectId} />
      </div>
    </div>
  );
}
