'use client';

/**
 * EvidenceUploader — drag-drop, multi-file, mock S3 upload.
 * 5.15: EvidenceUploader (drag-drop, multi-file, S3 pre-signed)
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadEvidence } from '@/lib/api/negotiation';
import { cn } from '@/lib/utils';

interface EvidenceUploaderProps {
  milestoneId: string;
  projectId: string;
  onUploaded?: () => void;
}

interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  preview?: string;
}

export function EvidenceUploader({ milestoneId, projectId, onUploaded }: EvidenceUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadEvidence();

  const addFiles = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles
      .filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf')
      .filter((f) => f.size <= 5 * 1024 * 1024) // 5MB max
      .map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        status: 'pending' as const,
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleUploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    for (const item of pending) {
      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'uploading' } : f));
      try {
        await uploadMutation.mutateAsync({ milestoneId, fileName: item.file.name, projectId });
        setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'done' } : f));
      } catch {
        setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'error' } : f));
      }
    }
    onUploaded?.();
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const hasPending = files.some((f) => f.status === 'pending');

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-border hover:border-accent/50 hover:bg-muted/20',
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload evidence files"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, PDF · Max 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              {/* Preview */}
              {item.preview ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
              )}

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">{(item.file.size / 1024).toFixed(0)} KB</p>
              </div>

              {/* Status */}
              {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />}
              {item.status === 'done' && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
              {item.status === 'error' && <span className="text-xs text-destructive shrink-0">Failed</span>}
              {item.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {hasPending && (
        <Button
          onClick={handleUploadAll}
          disabled={uploadMutation.isPending}
          className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {uploadMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="h-4 w-4" /> Upload {files.filter((f) => f.status === 'pending').length} file(s)</>
          )}
        </Button>
      )}
    </div>
  );
}
