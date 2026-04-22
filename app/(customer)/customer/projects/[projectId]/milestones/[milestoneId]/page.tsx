'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useMilestone } from '@/lib/api/negotiation';
import { EscrowStatusBadge } from '@/components/milestone/EscrowStatusBadge';
import { EvidenceUploader } from '@/components/milestone/EvidenceUploader';
import { MilestoneCard } from '@/components/milestone/MilestoneCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function MilestoneDetailPage() {
  const params = useParams<{ projectId: string; milestoneId: string }>();
  const { data: milestone, isLoading } = useMilestone(params.milestoneId);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-page-in">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!milestone) return <p className="text-muted-foreground">Milestone not found.</p>;

  return (
    <div className="space-y-6 animate-page-in max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/customer/projects/${params.projectId}/milestones`} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Milestones
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">{milestone.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
      </div>

      <EscrowStatusBadge status={milestone.escrowStatus} />

      <MilestoneCard
        milestone={milestone}
        projectId={params.projectId}
        viewerRole="CUSTOMER"
        order={milestone.order}
      />

      {/* Evidence upload for vendor */}
      {(milestone.status === 'FUNDED' || milestone.status === 'IN_PROGRESS') && (
        <div className="neu-card-3d rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Upload Evidence</h2>
          <EvidenceUploader milestoneId={milestone.id} projectId={params.projectId} />
        </div>
      )}
    </div>
  );
}
