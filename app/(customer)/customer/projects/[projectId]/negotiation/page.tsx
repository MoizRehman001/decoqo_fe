'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NegotiationChat } from '@/components/negotiation/NegotiationChat';

export default function CustomerNegotiationPage() {
  const params = useParams<{ projectId: string }>();
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] animate-page-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 shrink-0">
        <Link href={`/customer/projects/${params.projectId}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Project
        </Link>
      </div>
      <div className="flex-1 neu-card-3d rounded-2xl overflow-hidden min-h-0">
        <NegotiationChat projectId={params.projectId} viewerRole="CUSTOMER" />
      </div>
    </div>
  );
}
