'use client';

/**
 * Customer dispute evidence upload page.
 * Route: /customer/projects/[projectId]/milestones/[milestoneId]/dispute
 * 7.5: Dispute evidence upload (customer + vendor)
 */

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react';
import { EvidenceUploader } from '@/components/milestone/EvidenceUploader';
import { EvidenceGallery } from '@/components/milestone/EvidenceGallery';
import { useMilestone } from '@/lib/api/negotiation';

interface PageProps {
  params: Promise<{ projectId: string; milestoneId: string }>;
}

export default function CustomerDisputeEvidencePage({ params }: PageProps) {
  const { projectId, milestoneId } = use(params);
  const { data: milestone } = useMilestone(milestoneId);

  const isDisputed = milestone?.status === 'DISPUTED';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/customer/projects/${projectId}/milestones`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Milestones
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-destructive font-medium">Dispute Evidence</span>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Dispute Evidence</h1>
        {milestone && (
          <p className="mt-1 text-sm text-muted-foreground">{milestone.title}</p>
        )}
      </div>

      {/* Dispute status banner */}
      {isDisputed && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Dispute Active</p>
            <p className="mt-0.5 text-sm text-destructive/80">
              Escrow is held pending admin review. Upload evidence to support your case.
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">Evidence Guidelines</p>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Upload photos, videos, or documents that support your claim</li>
          <li>Include before/after photos if available</li>
          <li>Site inspection reports and invoices are helpful</li>
          <li>All evidence is reviewed by Decoqo admin</li>
        </ul>
      </div>

      {/* Upload */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-foreground">Upload Evidence</h2>
        <EvidenceUploader
          milestoneId={milestoneId}
          projectId={projectId}
        />
      </div>

      {/* Existing evidence */}
      {milestone && milestone.evidence.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Uploaded Evidence ({milestone.evidence.length})
          </h2>
          <EvidenceGallery evidence={milestone.evidence} />
        </div>
      )}
    </div>
  );
}
