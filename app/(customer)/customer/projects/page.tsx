'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project/ProjectCard';
import { useProjects } from '@/lib/api/projects';
import type { Project } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Skeleton fixture
// ---------------------------------------------------------------------------

function ProjectsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="ivory-card rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CustomerProjectsPage() {
  const { data: projectsResult, isLoading, isError } = useProjects();

  const projects: Project[] = projectsResult?.data ?? (Array.isArray(projectsResult) ? projectsResult as Project[] : []);

  return (
    <div className="space-y-6 animate-page-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">My Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/customer/projects/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Project
          </Link>
        </Button>
      </div>

      <Skeleton
        name="customer-projects-grid"
        loading={isLoading}
        animate="shimmer"
        transition={300}
        fixture={<ProjectsGridSkeleton />}
      >
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-sm text-destructive">
            Failed to load projects. Please refresh.
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="neu-card-3d rounded-2xl p-12 text-center">
            <p className="font-serif text-lg font-semibold text-foreground">No projects yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Create your first project to get started.</p>
            <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/customer/projects/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Create Project
              </Link>
            </Button>
          </div>
        )}
      </Skeleton>
    </div>
  );
}
