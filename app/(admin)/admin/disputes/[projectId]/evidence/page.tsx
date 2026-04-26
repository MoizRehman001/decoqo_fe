'use client';

/**
 * Admin dispute evidence bundle page.
 * Route: /admin/disputes/[projectId]/evidence
 * 7.6: EvidenceBundle viewer (admin side)
 */

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { EvidenceBundle } from '@/components/dispute/EvidenceBundle';
import { ProjectTimeline } from '@/components/timeline/ProjectTimeline';
import { useProject } from '@/lib/api/projects';
import { useMilestones } from '@/lib/api/negotiation';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function AdminDisputeEvidencePage({ params }: PageProps) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);
  const { data: milestones } = useMilestones(projectId);

  const disputedMilestoneIds = (milestones ?? [])
    .filter((m) => m.status === 'DISPUTED')
    .map((m) => m.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/disputes"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Disputes
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-foreground font-medium truncate">
          {project?.title ?? 'Loading…'}
        </span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-destructive font-medium">Evidence</span>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Dispute Evidence Review</h1>
        {project && (
          <p className="mt-1 text-sm text-muted-foreground">
            {project.title} · {project.city}
          </p>
        )}
      </div>

      {/* Dispute alert */}
      {disputedMilestoneIds.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              {disputedMilestoneIds.length} disputed milestone{disputedMilestoneIds.length !== 1 ? 's' : ''}
            </p>
            <p className="mt-0.5 text-sm text-destructive/80">
              Review all evidence before making a decision.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* Evidence bundle */}
        <EvidenceBundle
          projectId={projectId}
          disputedMilestoneIds={disputedMilestoneIds}
        />

        {/* Timeline sidebar */}
        <div className="xl:sticky xl:top-20 xl:self-start">
          <ProjectTimeline projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
