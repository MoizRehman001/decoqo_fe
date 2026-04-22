/**
 * BOQ + Payment API — TanStack Query keys + hooks.
 * Sprint 6 — BOQ Editor + Payments
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mockBoqApi,
  mockPaymentApi,
  type AddBoqItemPayload,
  type UpdateBoqItemPayload,
  type RaiseVariationPayload,
} from '@/mock/mockData';
import type { Boq, BoqItem, Variation, PaymentHistoryItem } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const boqKeys = {
  all: ['boq'] as const,
  byProject: (projectId: string) => [...boqKeys.all, 'project', projectId] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  history: (projectId: string) => [...paymentKeys.all, 'history', projectId] as const,
};

// ---------------------------------------------------------------------------
// BOQ Hooks
// ---------------------------------------------------------------------------

export function useBoq(projectId: string) {
  return useQuery<Boq | null, Error>({
    queryKey: boqKeys.byProject(projectId),
    queryFn: () => mockBoqApi.getBoq(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, string>({
    mutationFn: (projectId) => mockBoqApi.createBoq(projectId),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useAddBoqItem() {
  const queryClient = useQueryClient();
  return useMutation<BoqItem, Error, AddBoqItemPayload & { projectId: string }>({
    mutationFn: ({ projectId: _pid, ...payload }) => mockBoqApi.addItem(payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useUpdateBoqItem() {
  const queryClient = useQueryClient();
  return useMutation<BoqItem, Error, UpdateBoqItemPayload & { projectId: string }>({
    mutationFn: ({ projectId: _pid, ...payload }) => mockBoqApi.updateItem(payload),
    // Optimistic update
    onMutate: async ({ boqId, itemId, projectId, ...changes }) => {
      await queryClient.cancelQueries({ queryKey: boqKeys.byProject(projectId) });
      const previous = queryClient.getQueryData<Boq | null>(boqKeys.byProject(projectId));
      if (previous) {
        queryClient.setQueryData<Boq>(boqKeys.byProject(projectId), (old) => {
          if (!old) return old!;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    ...changes,
                    amountPaise: Math.round(
                      (changes.quantity ?? item.quantity) * (changes.ratePaise ?? item.ratePaise),
                    ),
                  }
                : item,
            ),
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

export function useRemoveBoqItem() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { boqId: string; itemId: string; projectId: string }>({
    mutationFn: ({ boqId, itemId }) => mockBoqApi.removeItem(boqId, itemId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useSubmitBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string }>({
    mutationFn: ({ boqId }) => mockBoqApi.submitBoq(boqId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useApproveBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string }>({
    mutationFn: ({ boqId }) => mockBoqApi.approveBoq(boqId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useLockBoq() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string }>({
    mutationFn: ({ boqId }) => mockBoqApi.lockBoq(boqId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useRequestBoqChanges() {
  const queryClient = useQueryClient();
  return useMutation<Boq, Error, { boqId: string; projectId: string }>({
    mutationFn: ({ boqId }) => mockBoqApi.requestChanges(boqId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useRaiseVariation() {
  const queryClient = useQueryClient();
  return useMutation<Variation, Error, RaiseVariationPayload & { projectId: string }>({
    mutationFn: ({ projectId: _pid, ...payload }) => mockBoqApi.raiseVariation(payload),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useApproveVariation() {
  const queryClient = useQueryClient();
  return useMutation<Variation, Error, { boqId: string; variationId: string; projectId: string }>({
    mutationFn: ({ boqId, variationId }) => mockBoqApi.approveVariation(boqId, variationId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

export function useRejectVariation() {
  const queryClient = useQueryClient();
  return useMutation<Variation, Error, { boqId: string; variationId: string; projectId: string }>({
    mutationFn: ({ boqId, variationId }) => mockBoqApi.rejectVariation(boqId, variationId),
    onSuccess: (_data, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: boqKeys.byProject(projectId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Payment Hooks
// ---------------------------------------------------------------------------

export function usePaymentHistory(projectId: string) {
  return useQuery<PaymentHistoryItem[], Error>({
    queryKey: paymentKeys.history(projectId),
    queryFn: () => mockPaymentApi.getPaymentHistory(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useInitiateEscrow() {
  return useMutation<{ razorpayOrderId: string; amountPaise: number; keyId: string }, Error, string>({
    mutationFn: (milestoneId) => mockPaymentApi.initiateEscrowFunding(milestoneId),
  });
}
