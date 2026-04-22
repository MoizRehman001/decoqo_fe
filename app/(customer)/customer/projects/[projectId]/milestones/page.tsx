'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MilestoneList } from '@/components/milestone/MilestoneList';
import { useProject } from '@/lib/api/projects';

export default function CustomerMilestonesPage() {
  const params = useParams<{ projectId: string }>();
  const { data: project } = useProject(params.projectId);

  return (
    <div className="space-y-6 animate-page-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/customer/projects/${params.projectId}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Project
        </Link>
      </div>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Milestones</h1>
        <p className="mt-1 text-sm text-muted-foreground">{project?.title}</p>
      </div>
      <MilestoneList projectId={params.projectId} viewerRole="CUSTOMER" />
    </div>
  );
}
