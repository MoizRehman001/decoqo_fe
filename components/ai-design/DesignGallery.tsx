'use client';

/**
 * DesignGallery — shows 2–3 AI-generated design options.
 * CUST-17: Design gallery (2-3 options, select and lock — irreversible)
 * CUST-44: Design lock confirmation dialog
 */

import { useState } from 'react';
import Image from 'next/image';
import { Check, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSelectDesign, useLockDesign } from '@/lib/api/bidding';
import type { AiDesign } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

interface DesignGalleryProps {
  design: AiDesign;
  projectId: string;
  onLocked: () => void;
}

export function DesignGallery({ design, projectId, onLocked }: DesignGalleryProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(design.selectedImageUrl);
  const [showLockDialog, setShowLockDialog] = useState(false);

  const selectMutation = useSelectDesign();
  const lockMutation = useLockDesign();

  const handleSelect = async (imageUrl: string) => {
    if (design.isLocked) return;
    setSelectedUrl(imageUrl);
    await selectMutation.mutateAsync({ designId: design.id, imageUrl, projectId });
  };

  const handleLock = async () => {
    try {
      await lockMutation.mutateAsync({ designId: design.id, projectId });
      setShowLockDialog(false);
      onLocked();
    } catch {
      // error shown via mutation state
    }
  };

  if (design.isLocked) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <Lock className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium text-accent">
            Design locked — this design is now part of your project record.
          </p>
        </div>
        {design.selectedImageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src={design.selectedImageUrl}
              alt="Locked AI design"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Choose Your Design
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the concept you love, then lock it. This action is irreversible.
          </p>
        </div>

        {/* Design grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {design.imageUrls.map((url, i) => {
            const isSelected = selectedUrl === url;
            return (
              <button
                key={url}
                type="button"
                onClick={() => handleSelect(url)}
                disabled={selectMutation.isPending}
                aria-pressed={isSelected}
                aria-label={`Design option ${i + 1}${isSelected ? ' (selected)' : ''}`}
                className={cn(
                  'group relative aspect-video w-full overflow-hidden rounded-2xl border-2 transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.2)]'
                    : 'border-border hover:border-accent/50',
                )}
              >
                <Image
                  src={url}
                  alt={`Design option ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Selection overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    Option {i + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => setShowLockDialog(true)}
          disabled={!selectedUrl || lockMutation.isPending}
          className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          Lock This Design
        </Button>
      </div>

      {/* Lock confirmation dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center font-serif">Lock This Design?</DialogTitle>
            <DialogDescription className="text-center">
              This action is <strong>irreversible</strong>. Once locked, this design becomes part of your project record and cannot be changed. Vendors will bid based on this design.
            </DialogDescription>
          </DialogHeader>

          {selectedUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <Image src={selectedUrl} alt="Selected design to lock" fill className="object-cover" />
            </div>
          )}

          {lockMutation.isError && (
            <p role="alert" className="text-center text-sm text-destructive">
              Failed to lock design. Please try again.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLockDialog(false)}
              disabled={lockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLock}
              disabled={lockMutation.isPending}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {lockMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Locking…</>
              ) : (
                <><Lock className="h-4 w-4" aria-hidden="true" /> Yes, Lock Design</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
