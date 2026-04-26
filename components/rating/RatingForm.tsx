'use client';

/**
 * RatingForm — 1-5 star rating with comment for project completion.
 * 7.9: Ratings submission form (1-5 stars + comment)
 */

import { useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitRating, useProjectRatings } from '@/lib/api/chat';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Star selector
// ---------------------------------------------------------------------------

interface StarSelectorProps {
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
}

function StarSelector({ value, onChange, readOnly = false }: StarSelectorProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
        role="group"
        aria-label="Star rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            disabled={readOnly}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            className={cn(
              'transition-all duration-100',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            )}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors duration-100',
                star <= display
                  ? 'fill-accent text-accent'
                  : 'fill-transparent text-muted-foreground/30',
              )}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      {!readOnly && display > 0 && (
        <p className="text-sm font-medium text-accent">{LABELS[display]}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RatingDisplay — read-only rating card
// ---------------------------------------------------------------------------

interface RatingDisplayProps {
  stars: number;
  comment: string;
  raterName: string;
  ratedBy: 'CUSTOMER' | 'VENDOR';
  createdAt: string;
}

export function RatingDisplay({ stars, comment, raterName, ratedBy, createdAt }: RatingDisplayProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{raterName}</p>
          <p className="text-xs text-muted-foreground capitalize">{ratedBy.toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                'h-4 w-4',
                s <= stars ? 'fill-accent text-accent' : 'fill-transparent text-muted-foreground/20',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      {comment && (
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          &ldquo;{comment}&rdquo;
        </p>
      )}
      <p className="text-[10px] text-muted-foreground/60">
        {new Date(createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RatingForm
// ---------------------------------------------------------------------------

interface RatingFormProps {
  projectId: string;
  viewerRole: 'CUSTOMER' | 'VENDOR';
}

export function RatingForm({ projectId, viewerRole }: RatingFormProps) {
  const { user } = useAuthStore();
  const { data: ratings } = useProjectRatings(projectId);
  const submitMutation = useSubmitRating();

  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const existingRating = ratings?.find((r) => r.ratedBy === viewerRole);
  const otherRating = ratings?.find((r) => r.ratedBy !== viewerRole);

  const handleSubmit = async () => {
    if (stars === 0) { setError('Please select a star rating.'); return; }
    if (!user) return;
    setError(null);
    try {
      await submitMutation.mutateAsync({
        projectId,
        ratedBy: viewerRole,
        raterName: user.name,
        stars: stars as 1 | 2 | 3 | 4 | 5,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Failed to submit rating.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Your rating */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-serif font-semibold text-foreground">
          {existingRating || submitted ? 'Your Rating' : 'Rate This Project'}
        </h3>

        {existingRating || submitted ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-medium text-foreground">Rating submitted</p>
            <StarSelector value={existingRating?.stars ?? stars} onChange={() => {}} readOnly />
            {(existingRating?.comment || comment) && (
              <p className="text-sm text-muted-foreground text-center italic max-w-sm">
                &ldquo;{existingRating?.comment ?? comment}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <>
            <StarSelector value={stars} onChange={setStars} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience working on this project…"
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || stars === 0}
              className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><Star className="h-4 w-4" /> Submit Rating</>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Other party's rating */}
      {otherRating && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            {otherRating.ratedBy === 'CUSTOMER' ? 'Customer' : 'Vendor'} Rating
          </p>
          <RatingDisplay
            stars={otherRating.stars}
            comment={otherRating.comment}
            raterName={otherRating.raterName}
            ratedBy={otherRating.ratedBy}
            createdAt={otherRating.createdAt}
          />
        </div>
      )}
    </div>
  );
}
