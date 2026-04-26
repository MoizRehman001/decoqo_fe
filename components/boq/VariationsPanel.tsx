'use client';

/**
 * VariationsPanel — shows all variations with diff view + approve/reject actions.
 * 6.10: Variation approve/reject (customer side)
 * Combines VariationDiff + approve/reject actions in one panel.
 */

import { useState } from 'react';
import { GitBranch, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VariationDiff } from '@/components/boq/VariationDiff';
import { VariationRaiseForm } from '@/components/boq/VariationRaiseForm';
import { useApproveVariation, useRejectVariation } from '@/lib/api/boq';
import type { Boq } from '@/types/boq.types';

interface VariationsPanelProps {
  boq: Boq;
  projectId: string;
  /** 'CUSTOMER' can approve/reject; 'VENDOR' can raise */
  viewerRole: 'CUSTOMER' | 'VENDOR';
}

export function VariationsPanel({ boq, projectId, viewerRole }: VariationsPanelProps) {
  const approveMutation = useApproveVariation();
  const rejectMutation = useRejectVariation();
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (variationId: string) => {
    setProcessingId(variationId);
    try {
      await approveMutation.mutateAsync({ boqId: boq.id, variationId, projectId });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (variationId: string) => {
    setProcessingId(variationId);
    try {
      await rejectMutation.mutateAsync({ boqId: boq.id, variationId, projectId });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingVariations = boq.variations.filter((v) => v.status === 'PENDING');
  const resolvedVariations = boq.variations.filter((v) => v.status !== 'PENDING');

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="font-serif font-semibold text-foreground">Variations</h3>
            {boq.variations.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {boq.variations.length}
              </span>
            )}
          </div>
          {viewerRole === 'VENDOR' && boq.status === 'LOCKED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaiseForm(true)}
              className="gap-1.5"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Raise Variation
            </Button>
          )}
        </div>

        {boq.variations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <GitBranch className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No variations raised yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending variations */}
            {pendingVariations.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Pending Approval ({pendingVariations.length})
                </p>
                {pendingVariations.map((variation) => (
                  <div key={variation.id} className="space-y-3">
                    <VariationDiff variation={variation} />
                    {viewerRole === 'CUSTOMER' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(variation.id)}
                          disabled={processingId === variation.id}
                          className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {processingId === variation.id && approveMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Approve Variation
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(variation.id)}
                          disabled={processingId === variation.id}
                          className="gap-1.5 text-destructive hover:text-destructive hover:border-destructive/40"
                        >
                          {processingId === variation.id && rejectMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Resolved variations */}
            {resolvedVariations.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Resolved ({resolvedVariations.length})
                </p>
                {resolvedVariations.map((variation) => (
                  <VariationDiff key={variation.id} variation={variation} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raise variation form */}
      <VariationRaiseForm
        boq={boq}
        projectId={projectId}
        open={showRaiseForm}
        onClose={() => setShowRaiseForm(false)}
      />
    </>
  );
}
