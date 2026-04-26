'use client';

/**
 * Customer project timeline page.
 * Route: /customer/projects/[projectId]/timeline
 */

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectTimeline } from '@/components/timeline/ProjectTimeline';
import { useProject } from '@/lib/api/projects';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function CustomerProjectTimelinePage({ params }: PageProps) {
  const { projectId } = use(params);
  const { data: project } = useProject(projectId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/customer/projects/${projectId}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Project
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-accent font-medium">Timeline</span>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Project Timeline</h1>
        {project && (
          <p className="mt-1 text-sm text-muted-foreground">{project.title}</p>
        )}
      </div>

      <ProjectTimeline projectId={projectId} />
    </div>
  );
}
