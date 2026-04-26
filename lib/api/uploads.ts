/**
 * File Upload API — pre-signed S3 upload flow.
 * Endpoints verified against Decoqo_be/apps/api/src/modules/storage/storage.controller.ts
 *
 * PATTERN: Never POST file bytes through the NestJS API server.
 * All uploads use a 3-step pre-signed URL flow:
 *   1. POST /uploads/presign  → get S3 pre-signed URL + fileKey
 *   2. PUT <uploadUrl>        → upload bytes directly to S3 (no auth needed)
 *   3. Return fileKey         → caller stores fileKey as the CDN reference
 *
 * The backend's StorageService.getCdnUrl(fileKey) generates the public URL.
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Upload context values accepted by the backend StorageService */
export type UploadContext =
  | 'floor-plans'
  | 'designs'
  | 'evidence'
  | 'dispute-evidence'
  | 'kyc'
  | 'boq-pdfs'
  | 'portfolio';

export interface PresignResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface UploadParams {
  file: File;
  context: UploadContext;
  contextId: string;
  /** Optional progress callback (0–100) */
  onProgress?: (percent: number) => void;
}

// ---------------------------------------------------------------------------
// Core upload function
// ---------------------------------------------------------------------------

/**
 * Execute the full 3-step presigned upload flow.
 * Returns the fileKey which can be used to construct the CDN URL.
 */
export async function uploadFile(params: UploadParams): Promise<string> {
  const { file, context, contextId, onProgress } = params;

  // Step 1: Get pre-signed URL from backend
  const presign: PresignResponse = await apiClient.post('/uploads/presign', {
    fileName: file.name,
    mimeType: file.type,
    fileSizeBytes: file.size,
    context,
    contextId,
  });

  // Step 2: PUT file bytes directly to S3 with progress tracking
  await uploadToS3(presign.uploadUrl, file, onProgress);

  // Step 3: Return the fileKey for the caller to store
  return presign.fileKey;
}

/**
 * Upload a file to S3 using XMLHttpRequest for progress events.
 */
function uploadToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('S3 upload network error'));
    xhr.ontimeout = () => reject(new Error('S3 upload timed out'));

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.timeout = 120_000; // 2 minutes
    xhr.send(file);
  });
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * TanStack Query mutation hook for the presigned upload flow.
 * Handles progress tracking and returns the fileKey on success.
 */
export function useUploadFile() {
  return useMutation<string, Error, UploadParams>({
    mutationFn: uploadFile,
  });
}

/**
 * Convenience hook for uploading milestone evidence.
 * Returns the CDN URL after upload.
 */
export function useUploadEvidence() {
  return useMutation<string, Error, { file: File; milestoneId: string; onProgress?: (p: number) => void }>({
    mutationFn: ({ file, milestoneId, onProgress }) =>
      uploadFile({ file, context: 'evidence', contextId: milestoneId, onProgress }),
  });
}

/**
 * Convenience hook for uploading a floor plan.
 */
export function useUploadFloorPlan() {
  return useMutation<string, Error, { file: File; projectId: string; onProgress?: (p: number) => void }>({
    mutationFn: ({ file, projectId, onProgress }) =>
      uploadFile({ file, context: 'floor-plans', contextId: projectId, onProgress }),
  });
}

/**
 * Convenience hook for uploading KYC documents.
 */
export function useUploadKycDocument() {
  return useMutation<string, Error, { file: File; vendorId: string; onProgress?: (p: number) => void }>({
    mutationFn: ({ file, vendorId, onProgress }) =>
      uploadFile({ file, context: 'kyc', contextId: vendorId, onProgress }),
  });
}

/**
 * Convenience hook for uploading portfolio images.
 */
export function useUploadPortfolioImage() {
  return useMutation<string, Error, { file: File; vendorId: string; onProgress?: (p: number) => void }>({
    mutationFn: ({ file, vendorId, onProgress }) =>
      uploadFile({ file, context: 'portfolio', contextId: vendorId, onProgress }),
  });
}

/**
 * Convenience hook for uploading dispute evidence.
 */
export function useUploadDisputeEvidence() {
  return useMutation<string, Error, { file: File; disputeId: string; onProgress?: (p: number) => void }>({
    mutationFn: ({ file, disputeId, onProgress }) =>
      uploadFile({ file, context: 'dispute-evidence', contextId: disputeId, onProgress }),
  });
}
