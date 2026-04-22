'use client';

/**
 * AI Design page — generate and lock AI designs for a project.
 * CUST-15, CUST-16, CUST-17
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { DesignGenerator } from '@/components/ai-design/DesignGenerator';
import { DesignGallery } from '@/components/ai-design/DesignGallery';
import { useAiDesigns } from '@/lib/api/bidding';
import { Skeleton } from '@/components/ui/skeleton';
import type { AiDesign } from '@/types/bidding.types';

export default function ProjectDesignPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const { data: designs, isLoading } = useAiDesigns(projectId);
  const [generatedDesign, setGeneratedDesign] = useState<AiDesign | null>(null);

  const existingDesign = designs?.[0] ?? null;
  const activeDesign = generatedDesign ?? existingDesign;

  const handleLocked = () => {
    router.push(`/customer/projects/${projectId}/bidding-room`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-page-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/customer/projects/${projectId}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Project
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">AI Design Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate photorealistic design concepts for your space.
        </p>
      </div>

      <div className="neu-card-3d rounded-2xl p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}
            </div>
          </div>
        ) : activeDesign?.status === 'COMPLETED' ? (
          <DesignGallery
            design={activeDesign}
            projectId={projectId}
            onLocked={handleLocked}
          />
        ) : (
          <DesignGenerator
            projectId={projectId}
            onDesignsReady={setGeneratedDesign}
          />
        )}
      </div>
    </div>
  );
}
