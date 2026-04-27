'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface StorageSettings {
  id: string;
  enableS3: boolean;
  enableR2: boolean;
  enableLocal: boolean;
  uploadMode: 'VM_THEN_CLOUD' | 'DIRECT_CLOUD' | 'VM_ONLY';
  maxFileSizeBytes: number;
  deleteAfterUpload: boolean;
  s3Config?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrlBase?: string;
  };
  r2Config?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrlBase?: string;
  };
  updatedAt: string;
}

export const storageKeys = {
  settings: ['storage', 'settings'] as const,
};

export function useStorageSettings() {
  return useQuery<StorageSettings, Error>({
    queryKey: storageKeys.settings,
    queryFn: () => apiClient.get('/admin/storage/settings'),
    staleTime: 30_000,
  });
}

export function useUpdateStorageSettings() {
  const qc = useQueryClient();
  return useMutation<StorageSettings, Error, Partial<StorageSettings>>({
    mutationFn: (dto) => apiClient.put('/admin/storage/settings', dto),
    onSuccess: () => void qc.invalidateQueries({ queryKey: storageKeys.settings }),
  });
}
