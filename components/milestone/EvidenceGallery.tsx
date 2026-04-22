'use client';

/**
 * EvidenceGallery — image grid with lightbox.
 * 5.16: EvidenceGallery (image grid with lightbox)
 */

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { MilestoneEvidence } from '@/types/negotiation.types';

interface EvidenceGalleryProps {
  evidence: MilestoneEvidence[];
}

export function EvidenceGallery({ evidence }: EvidenceGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (evidence.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No evidence uploaded yet.
      </p>
    );
  }

  const prev = () => setLightboxIdx((i) => (i !== null ? Math.max(0, i - 1) : null));
  const next = () => setLightboxIdx((i) => (i !== null ? Math.min(evidence.length - 1, i + 1) : null));

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {evidence.map((ev, i) => (
          <button
            key={ev.id}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border hover:border-accent/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`View ${ev.fileName}`}
          >
            <Image
              src={ev.fileUrl}
              alt={ev.fileName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Evidence lightbox"
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={evidence[lightboxIdx]!.fileUrl}
              alt={evidence[lightboxIdx]!.fileName}
              width={900}
              height={700}
              className="object-contain max-h-[85vh] max-w-[90vw]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2 text-xs text-white/80">
              {evidence[lightboxIdx]!.fileName} · {lightboxIdx + 1} / {evidence.length}
            </div>
          </div>

          {/* Next */}
          {lightboxIdx < evidence.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
