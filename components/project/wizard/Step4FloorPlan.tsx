'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from './WizardShell';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Step4FloorPlan() {
  const { state, dispatch, goNext } = useWizard();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please upload a JPG, PNG, or PDF file.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`File size must be under ${MAX_SIZE_MB}MB.`);
        return;
      }
      // Mock: store filename only
      dispatch({ type: 'SET_FLOOR_PLAN', payload: file.name });
    },
    [dispatch],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    dispatch({ type: 'SET_FLOOR_PLAN', payload: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isImage = state.floorPlanFile
    ? /\.(jpg|jpeg|png)$/i.test(state.floorPlanFile)
    : false;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Upload your floor plan
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Helps vendors understand your space better. You can skip this step.
        </p>
      </div>

      {/* Drop zone */}
      {!state.floorPlanFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload floor plan — click or drag and drop"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
            isDragging
              ? 'border-accent bg-accent/10'
              : 'border-border bg-muted/30 hover:border-accent/40 hover:bg-accent/5',
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Upload className="h-7 w-7 text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? 'Drop your file here' : 'Click to upload or drag & drop'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, PDF — max {MAX_SIZE_MB}MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleInputChange}
            className="sr-only"
            aria-hidden="true"
          />
        </div>
      ) : (
        /* File preview */
        <div className="flex items-center gap-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            {isImage ? (
              <Upload className="h-6 w-6 text-accent" aria-hidden="true" />
            ) : (
              <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {state.floorPlanFile}
            </p>
            <p className="text-xs text-muted-foreground">Uploaded successfully</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove uploaded file"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={goNext}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="h-4 w-4" aria-hidden="true" />
          Skip for now
        </Button>
        <Button
          type="button"
          onClick={goNext}
          disabled={!state.floorPlanFile}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Continue
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
