'use client';

/**
 * Customer project closure page — complete project + rate vendor.
 * Route: /customer/projects/[projectId]/closure
 */

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectClosure } from '@/components/project/ProjectClosure';
import { useProject } from '@/lib/api/projects';
import { Skeleton } from 'boneyard-js/react';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function CustomerProjectClosurePage({ params }: PageProps) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/customer/projects/${projectId}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Project
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-accent font-medium">Closure</span>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Project Closure</h1>
        {project && (
          <p className="mt-1 text-sm text-muted-foreground">{project.title}</p>
        )}
      </div>

      <Skeleton name="project-closure" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-4">
          <div className="h-40 w-full rounded-2xl bg-muted animate-pulse" />
          <div className="h-60 w-full rounded-2xl bg-muted animate-pulse" />
        </div>
      }>
        {project ? (
          <ProjectClosure project={project} viewerRole="CUSTOMER" />
        ) : null}
      </Skeleton>
    </div>
  );
}
