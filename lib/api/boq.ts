/**
 * BOQ API — real apiClient calls.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/boq/boq.controller.ts
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { Boq, BoqItem, BoqVersion, Variation } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const boqKeys = {
  all: ['boq'] as const,
  byProject: (projectId: string) => [...boqKeys.all, 'project', projectId] as const,
  versions: (boqId: string) => [...boqKeys.all, 'versions', boqId] as const,
  variations: (boqId: string) => [...boqKeys.all, 'variations', boqId] as const,
};

// ---------------------------------------------------------------------------
// BOQ Hooks
// ---------------------------------------------------------------------------

/** Get the current BOQ for a project. GET /api/v1/projects/:id/boq */
export function useBoq(projectId: string) {
  return useQuery<Boq | null, Error>({
    queryKey: boqKeys.byProject(projectId),
    queryFn: () => apiClient.get(`/projects/${projectId}/boq`),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/** Create a BOQ for a project (vendor). POST /api/v1/projects/:id/boq */
export function useCreateBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, string>({
    mutationFn: (projectId) => apiClient.post(`/projects/${projectId}/boq`),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Add an item to the BOQ. POST /api/v1/boq/:id/items */
export function useAddBoqItem() {
  const queryClient = useQueryClient();
  return useMutation<
    BoqItem & { boqGrandTotalInr: number },
    Error,
    {
      boqId: string;
      projectId: string;
      room: string;
      category: string;
      description: string;
      material?: string;
      brand?: string;
      quantity: number;
      unit: string;
      rateInr: number;
      milestoneId?: string;
      notes?: string;
      sortOrder?: number;
    }
  >({
    mutationFn: ({ boqId, projectId: _pid, ...payload }) =>
      apiClient.post(`/boq/${boqId}/items`, payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Update a BOQ item. PATCH /api/v1/boq/:id/items/:itemId */
export function useUpdateBoqItem() {
  const queryClient = useQueryClient();
  return useMutation<
    BoqItem,
    Error,
    {
      boqId: string;
      itemId: string;
      projectId: string;
      quantity?: number;
      rateInr?: number;
      description?: string;
      material?: string;
      brand?: string;
    }
  >({
    mutationFn: ({ boqId, itemId, projectId: _pid, ...changes }) =>
      apiClient.patch(`/boq/${boqId}/items/${itemId}`, changes),
    // Optimistic update — recalculate amount instantly
    onMutate: async ({ boqId, itemId, projectId, rateInr, quantity }) => {
      await queryClient.cancelQueries({ queryKey: boqKeys.byProject(projectId) });
      const previous = queryClient.getQueryData<Boq | null>(boqKeys.byProject(projectId));
      if (previous) {
        queryClient.setQueryData<Boq>(boqKeys.byProject(projectId), (old) => {
          if (!old) return old!;
          const updatedItems = old.items.map((item) => {
            if (item.id !== itemId) return item;
            const newQty = quantity ?? item.quantity;
            // rateInr from frontend → ratePaise for display
            const newRatePaise = rateInr !== undefined ? Math.round(rateInr * 100) : item.ratePaise;
            return {
              ...item,
              quantity: newQty,
              ratePaise: newRatePaise,
              amountPaise: Math.round(newQty * newRatePaise),
            };
          });
          return {
            ...old,
            items: updatedItems,
            grandTotalPaise: updatedItems.reduce((s, i) => s + i.amountPaise, 0),
          };
        });
      }
      return { previous };
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(boqKeys.byProject(projectId), context.previous);
      }
    },
    onSettled: (_data, _err, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Remove a BOQ item. DELETE /api/v1/boq/:id/items/:itemId */
export function useRemoveBoqItem() {
  const queryClient = useQueryClient();
  return useMutation<{ deleted: boolean }, Error, { boqId: string; itemId: string; projectId: string }>({
    mutationFn: ({ boqId, itemId }) => apiClient.delete(`/boq/${boqId}/items/${itemId}`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Submit BOQ for customer review. POST /api/v1/boq/:id/submit */
export function useSubmitBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string }>({
    mutationFn: ({ boqId }) => apiClient.post(`/boq/${boqId}/submit`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Customer approves BOQ. POST /api/v1/boq/:id/approve */
export function useApproveBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string }>({
    mutationFn: ({ boqId }) => apiClient.post(`/boq/${boqId}/approve`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Customer requests changes to BOQ. POST /api/v1/boq/:id/request-changes */
export function useRequestBoqChanges() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string; reason?: string }>({
    mutationFn: ({ boqId, reason }) => apiClient.post(`/boq/${boqId}/request-changes`, { reason }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Lock approved BOQ (vendor). POST /api/v1/boq/:id/lock */
export function useLockBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string }>({
    mutationFn: ({ boqId }) => apiClient.post(`/boq/${boqId}/lock`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Get BOQ version history. GET /api/v1/boq/:id/versions */
export function useBoqVersions(boqId: string) {
  return useQuery<BoqVersion[], Error>({
    queryKey: boqKeys.versions(boqId),
    queryFn: () => apiClient.get(`/boq/${boqId}/versions`),
    enabled: !!boqId,
    staleTime: 60_000,
  });
}

/** Raise a variation on a locked BOQ. POST /api/v1/boq/:id/variations */
export function useRaiseVariation() {
  const queryClient = useQueryClient();
  return useMutation<
    Variation,
    Error,
    {
      boqId: string;
      projectId: string;
      type: 'POSITIVE' | 'NEGATIVE';
      reason: string;
      deltaAmountInr: number;
      affectedItems: Array<{
        itemId: string;
        description: string;
        oldRateInr: number;
        newRateInr: number;
        oldQuantity: number;
        newQuantity: number;
      }>;
    }
  >({
    mutationFn: ({ boqId, projectId: _pid, ...payload }) =>
      apiClient.post(`/boq/${boqId}/variations`, payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Customer approves a variation. POST /api/v1/boq/:id/variations/:varId/approve */
export function useApproveVariation() {
  const queryClient = useQueryClient();
  return useMutation<{ approved: boolean }, Error, { boqId: string; variationId: string; projectId: string }>({
    mutationFn: ({ boqId, variationId }) =>
      apiClient.post(`/boq/${boqId}/variations/${variationId}/approve`),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Customer rejects a variation. POST /api/v1/boq/:id/variations/:varId/reject */
export function useRejectVariation() {
  const queryClient = useQueryClient();
  return useMutation<
    { rejected: boolean },
    Error,
    { boqId: string; variationId: string; projectId: string; reason: string }
  >({
    mutationFn: ({ boqId, variationId, reason }) =>
      apiClient.post(`/boq/${boqId}/variations/${variationId}/reject`, { reason }),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

/** Queue BOQ PDF generation. GET /api/v1/boq/:id/quotation/pdf */
export function useBoqPdf() {
  return useMutation<{ jobId: string; status: string; message: string }, Error, string>({
    mutationFn: (boqId) => apiClient.get(`/boq/${boqId}/quotation/pdf`),
  });
}
