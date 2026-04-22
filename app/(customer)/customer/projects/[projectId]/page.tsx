'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProjectOverview, ProjectOverviewSkeleton } from '@/components/project/ProjectOverview';
import { useProject } from '@/lib/api/projects';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = use(params);
  const { data: project, isLoading, error } = useProject(projectId);

  return (
    <div className="space-y-6 animate-page-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/customer/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          My Projects
        </Link>
      </nav>

      {isLoading ? (
        <ProjectOverviewSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load project. Please try again.
          </p>
          <Link
            href="/customer/projects"
            className="mt-3 inline-block text-sm text-accent underline underline-offset-2"
          >
            Back to projects
          </Link>
        </div>
      ) : project ? (
        <ProjectOverview project={project} activeTab="" />
      ) : null}
    </div>
  );
}
