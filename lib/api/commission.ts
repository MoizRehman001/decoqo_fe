/**
 * Commission & BOQ PDF Settings API hooks.
 * Endpoints verified against backend commission and boq modules.
 * All commission endpoints require ADMIN or SUPER_ADMIN role.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { PaginatedResult } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommissionPolicyConditions {
  projectCountLessThan?: number;
  projectCountGreaterThan?: number;
  amountLessThan?: number;
  amountGreaterThan?: number;
  startDate?: string;
  endDate?: string;
  projectCountRange?: { min: number; max: number };
  ratingAbove?: { rating: number };
  gmvAbove?: { gmvPaise: number };
  daysSinceJoined?: { days: number };
}

export interface CommissionPolicyActions {
  commissionPercent: number;
  platformFeePercent?: number;
}

export type CommissionPolicyType =
  | 'PROJECT_COUNT'
  | 'TIME_RANGE'
  | 'AMOUNT_RANGE'
  | 'CUSTOM_OVERRIDE';

export interface CommissionPolicy {
  id: string;
  name: string;
  description?: string;
  type: CommissionPolicyType;
  priority: number;
  isActive: boolean;
  conditions: CommissionPolicyConditions;
  actions: CommissionPolicyActions;
  applicableDesignerIds: string[];
  applicableCities: string[];
  applicableStates: string[];
  createdAt: string;
}

export interface CreateCommissionPolicyDto {
  name: string;
  description?: string;
  type: CommissionPolicyType;
  priority: number;
  conditions: CommissionPolicyConditions;
  actions: CommissionPolicyActions;
  applicableDesignerIds?: string[];
  applicableCities?: string[];
  applicableStates?: string[];
}

export type UpdateCommissionPolicyDto = Partial<CreateCommissionPolicyDto>;

export interface SimulateCommissionDto {
  designerId: string;
  projectAmountPaise: number;
  cityId?: string;
  stateId?: string;
}

export interface SimulateCommissionResult {
  matchedPolicy?: CommissionPolicy;
  matchedPolicyId?: string | null;
  matchedPolicyName?: string | null;
  commissionPercent: number;
  platformFeePercent?: number;
  commissionAmountPaise?: number;
  isFallback?: boolean;
}

export interface VendorOverride {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string | null;
  commissionPercent: number;
  reason: string;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetVendorOverrideDto {
  commissionPercent: number;
  reason: string;
  expiresAt?: string;
}

export interface VendorCommissionSummary {
  vendorId: string;
  currentPolicy: {
    id: string | null;
    name: string | null;
    commissionPercent: number;
    isFallback: boolean;
    isOverride: boolean;
  };
  totalCommissionPaidPaise: number;
  projectsCompleted: number;
  projectsRemainingBeforeCommission: number | null;
  nextPolicy: {
    id: string | null;
    name: string | null;
    commissionPercent: number;
  } | null;
  override: VendorOverride | null;
}

export interface CommissionApplication {
  id: string;
  projectId: string;
  vendorId: string;
  vendorName: string | null;
  policyId: string | null;
  policyName: string | null;
  commissionPercent: number;
  commissionAmountPaise: number;
  isFallback: boolean;
  appliedAt: string;
}

export interface BoqPdfSettings {
  id: string;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkAngle: number;
  showClientName: boolean;
  showTimestamp: boolean;
  isActive: boolean;
  updatedAt: string;
}

export type UpdateBoqPdfSettingsDto = Partial<Omit<BoqPdfSettings, 'id' | 'updatedAt'>>;

export interface DesignerSearchResult {
  id: string;
  displayName: string;
  businessName: string;
  city: string;
  email: string | null;
  phone: string | null;
  kycStatus: string;
  isApproved: boolean;
}

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const commissionKeys = {
  policies: ['commission', 'policies'] as const,
  overrides: ['commission', 'overrides'] as const,
  applications: (page: number, search?: string) => ['commission', 'applications', page, search] as const,
  vendorSummary: (vendorId: string) => ['commission', 'vendor', vendorId, 'summary'] as const,
  vendorOverride: (vendorId: string) => ['commission', 'vendor', vendorId, 'override'] as const,
  boqSettings: ['boq', 'pdf-settings'] as const,
};

// ---------------------------------------------------------------------------
// Designer Search
// ---------------------------------------------------------------------------

export function useSearchDesigners(q: string) {
  return useQuery<DesignerSearchResult[], Error>({
    queryKey: ['commission', 'designers', 'search', q],
    queryFn: () =>
      apiClient.get('/admin/commission/designers/search', {
        params: { q: q.trim(), limit: 20 },
      }),
    enabled: q.trim().length >= 1,
    staleTime: 10_000,
  });
}

// ---------------------------------------------------------------------------
// Commission Policies
// ---------------------------------------------------------------------------

export function useCommissionPolicies() {
  return useQuery<PaginatedResult<CommissionPolicy>, Error>({
    queryKey: commissionKeys.policies,
    queryFn: async () => {
      const result = await apiClient.get('/admin/commission/policies') as
        | PaginatedResult<CommissionPolicy>
        | CommissionPolicy[];
      if (Array.isArray(result)) {
        return { data: result, total: result.length, page: 1, limit: 50, totalPages: 1 } as unknown as PaginatedResult<CommissionPolicy>;
      }
      return result;
    },
    staleTime: 15_000,
  });
}

export function useCreateCommissionPolicy() {
  const qc = useQueryClient();
  return useMutation<CommissionPolicy, Error, CreateCommissionPolicyDto>({
    mutationFn: (dto) => apiClient.post('/admin/commission/policies', dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.policies }),
  });
}

export function useUpdateCommissionPolicy() {
  const qc = useQueryClient();
  return useMutation<CommissionPolicy, Error, { id: string; dto: UpdateCommissionPolicyDto }>({
    mutationFn: ({ id, dto }) => apiClient.patch(`/admin/commission/policies/${id}`, dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.policies }),
  });
}

export function useSetCommissionPolicyPriority() {
  const qc = useQueryClient();
  return useMutation<CommissionPolicy, Error, { id: string; priority: number }>({
    mutationFn: ({ id, priority }) =>
      apiClient.patch(`/admin/commission/policies/${id}/priority`, { priority }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.policies }),
  });
}

export function useToggleCommissionPolicyActive() {
  const qc = useQueryClient();
  return useMutation<CommissionPolicy, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) =>
      apiClient.patch(`/admin/commission/policies/${id}/active`, { isActive }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.policies }),
  });
}

export function useDeleteCommissionPolicy() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete(`/admin/commission/policies/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.policies }),
  });
}

export function useDuplicateCommissionPolicy() {
  const qc = useQueryClient();
  return useMutation<CommissionPolicy, Error, CommissionPolicy>({
    mutationFn: (policy) =>
      apiClient.post('/admin/commission/policies', {
        name: `${policy.name} (Copy)`,
        description: policy.description,
        type: policy.type,
        priority: policy.priority,
        conditions: policy.conditions,
        actions: policy.actions,
        applicableDesignerIds: policy.applicableDesignerIds,
        applicableCities: policy.applicableCities,
        applicableStates: policy.applicableStates,
      } satisfies CreateCommissionPolicyDto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.policies }),
  });
}

export function useSimulateCommission() {
  return useMutation<SimulateCommissionResult, Error, SimulateCommissionDto>({
    mutationFn: (dto) => apiClient.post('/admin/commission/simulate', dto),
  });
}

// ---------------------------------------------------------------------------
// Per-Vendor Overrides
// ---------------------------------------------------------------------------

export function useVendorOverrides() {
  return useQuery<VendorOverride[], Error>({
    queryKey: commissionKeys.overrides,
    queryFn: () => apiClient.get('/admin/commission/overrides'),
    staleTime: 15_000,
  });
}

export function useVendorOverride(vendorId: string) {
  return useQuery<VendorOverride, Error>({
    queryKey: commissionKeys.vendorOverride(vendorId),
    queryFn: () => apiClient.get(`/admin/commission/vendor/${vendorId}/override`),
    enabled: !!vendorId,
    staleTime: 15_000,
    retry: false,
  });
}

export function useSetVendorOverride() {
  const qc = useQueryClient();
  return useMutation<VendorOverride, Error, { vendorId: string; dto: SetVendorOverrideDto }>({
    mutationFn: ({ vendorId, dto }) =>
      apiClient.post(`/admin/commission/vendor/${vendorId}/override`, dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.overrides }),
  });
}

export function useRemoveVendorOverride() {
  const qc = useQueryClient();
  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (vendorId) =>
      apiClient.delete(`/admin/commission/vendor/${vendorId}/override`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.overrides }),
  });
}

// ---------------------------------------------------------------------------
// Vendor Commission Summary
// ---------------------------------------------------------------------------

export function useVendorCommissionSummary(vendorId: string) {
  return useQuery<VendorCommissionSummary, Error>({
    queryKey: commissionKeys.vendorSummary(vendorId),
    queryFn: () => apiClient.get(`/admin/commission/vendor/${vendorId}/summary`),
    enabled: !!vendorId,
    staleTime: 15_000,
  });
}

// ---------------------------------------------------------------------------
// Commission Applications History
// ---------------------------------------------------------------------------

export function useCommissionApplications(page = 1, vendorSearch?: string) {
  return useQuery<PaginatedResult<CommissionApplication>, Error>({
    queryKey: commissionKeys.applications(page, vendorSearch),
    queryFn: async () => {
      const result = await apiClient.get('/admin/commission/applications', {
        params: { page, limit: 20, vendorSearch: vendorSearch?.trim() || undefined },
      }) as PaginatedResult<CommissionApplication> | CommissionApplication[];
      if (Array.isArray(result)) {
        return { data: result, total: result.length, page: 1, limit: 20, totalPages: 1 } as unknown as PaginatedResult<CommissionApplication>;
      }
      return result;
    },
    staleTime: 15_000,
  });
}

// ---------------------------------------------------------------------------
// BOQ PDF Settings
// ---------------------------------------------------------------------------

export function useBoqPdfSettings() {
  return useQuery<BoqPdfSettings, Error>({
    queryKey: commissionKeys.boqSettings,
    queryFn: () => apiClient.get('/admin/boq/pdf-settings'),
    staleTime: 30_000,
  });
}

export function useUpdateBoqPdfSettings() {
  const qc = useQueryClient();
  return useMutation<BoqPdfSettings, Error, UpdateBoqPdfSettingsDto>({
    mutationFn: (dto) => apiClient.patch('/admin/boq/pdf-settings', dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: commissionKeys.boqSettings }),
  });
}
