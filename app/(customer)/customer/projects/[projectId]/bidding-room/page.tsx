'use client';

/**
 * Bidding Room page — customer view of all anonymous bids.
 * CUST-30 through CUST-41
 */

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BiddingRoomTable } from '@/components/bidding/BiddingRoomTable';
import { useProject } from '@/lib/api/projects';
import { ProjectStatusBadge } from '@/components/project/ProjectStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

export default function BiddingRoomPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data: project, isLoading } = useProject(projectId);

  return (
    <div className="space-y-6 animate-page-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/customer/projects/${projectId}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Project
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl font-semibold text-foreground">
                  Bidding Room
                </h1>
                {project && <ProjectStatusBadge status={project.status} />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {project?.title} · {project?.city}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Anonymity notice */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-foreground">
        <span className="font-semibold text-accent">🔒 Anonymous Bidding Active</span>
        {' '}— Vendor identities are hidden until you select one. Compare bids on merit alone.
      </div>

      {/* Bidding table */}
      <BiddingRoomTable projectId={projectId} />
    </div>
  );
}
