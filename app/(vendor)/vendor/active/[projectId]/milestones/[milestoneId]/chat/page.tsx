'use client';

/**
 * Vendor milestone chat page.
 * Route: /vendor/active/[projectId]/milestones/[milestoneId]/chat
 */

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChatThread } from '@/components/chat/ChatThread';
import { useMilestone } from '@/lib/api/negotiation';

interface PageProps {
  params: Promise<{ projectId: string; milestoneId: string }>;
}

export default function VendorMilestoneChatPage({ params }: PageProps) {
  const { projectId, milestoneId } = use(params);
  const { data: milestone } = useMilestone(milestoneId);

  const readOnly = milestone
    ? ['RELEASED', 'DISPUTED'].includes(milestone.status)
    : false;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/vendor/active/${projectId}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Project
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-foreground font-medium truncate">
          {milestone?.title ?? 'Chat'}
        </span>
      </div>

      <div style={{ height: '600px' }}>
        <ChatThread
          milestoneId={milestoneId}
          projectId={projectId}
          milestoneTitle={milestone?.title ?? 'Milestone Chat'}
          viewerRole="VENDOR"
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
