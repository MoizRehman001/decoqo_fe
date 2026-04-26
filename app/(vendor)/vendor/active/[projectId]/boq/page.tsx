'use client';

/**
 * Vendor BOQ page — create, edit, submit, lock BOQ + manage variations.
 * Route: /vendor/active/[projectId]/boq
 */

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, History } from 'lucide-react';
import { BoqEditor } from '@/components/boq/BoqEditor';
import { VariationsPanel } from '@/components/boq/VariationsPanel';
import { BoqVersionHistory } from '@/components/boq/BoqVersionHistory';
import { useBoq } from '@/lib/api/boq';
import { useProject } from '@/lib/api/projects';
import { Skeleton } from 'boneyard-js/react';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function VendorBoqPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);
  const { data: boq } = useBoq(projectId);

  const projectRooms = project?.rooms.map((r) => r.name) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/vendor/projects"
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
      <Skeleton name="vendor-boq" loading={isLoading} animate="shimmer" transition={300} fixture={
        <div className="space-y-4">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          <div className="h-64 w-full rounded-2xl bg-muted animate-pulse" />
        </div>
      }>
        <>
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

          {/* BOQ Editor */}
          <BoqEditor projectId={projectId} projectRooms={projectRooms} />

          {/* Variations panel — only shown when BOQ exists */}
          {boq && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 pt-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-serif text-lg font-semibold text-foreground">Variation Orders</h2>
              </div>
              <VariationsPanel boq={boq} projectId={projectId} viewerRole="VENDOR" />
            </div>
          )}

          {/* Version history — only shown when BOQ has versions */}
          {boq && boq.versions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 pt-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-serif text-lg font-semibold text-foreground">Version History</h2>
              </div>
              <BoqVersionHistory versions={boq.versions} />
            </div>
          )}
        </>
      </Skeleton>
    </div>
  );
}
