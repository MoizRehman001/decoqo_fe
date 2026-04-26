'use client';

/**
 * VendorProfileCard — anonymized vendor profile shown to customers.
 *
 * Privacy contract (CUST-35 / CUST-36):
 *   ✅ Shows: city, service areas, categories, bio, rating, reviews,
 *             portfolio images, KYC badge, years experience, past projects
 *   ❌ Never shows: name, phone, email, website, full address, userId
 */

import { useState } from 'react';
import Image from 'next/image';
import {
  Star, ShieldCheck, MapPin, Briefcase, Clock,
  CheckCircle2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorProfile } from '@/types/bidding.types';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarRating({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${score} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < Math.round(score)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function TrustBadge({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 dark:border-green-900 dark:bg-green-950">
      <Icon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" aria-hidden="true" />
      <span className="text-xs font-medium text-green-700 dark:text-green-300">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface VendorProfileCardProps {
  profile: VendorProfile;
  anonymousLabel: string;
  className?: string;
}

export function VendorProfileCard({ profile, anonymousLabel, className }: VendorProfileCardProps) {
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [portfolioExpanded, setPortfolioExpanded] = useState(false);

  const portfolioUrls = profile.portfolioUrls ?? [];
  const reviews = profile.recentReviews ?? [];
  const rating = profile.averageRating ?? profile.rating ?? 0;

  return (
    <div className={cn('space-y-5', className)}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        {/* Avatar placeholder — no real photo to preserve anonymity */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-serif text-xl font-bold"
          style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
          aria-hidden="true"
        >
          {anonymousLabel.slice(-1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-semibold text-foreground">{anonymousLabel}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {profile.city}
            </div>
            {profile.yearsExperience > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {profile.yearsExperience}y experience
              </div>
            )}
          </div>
          {/* Trust badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.isVerified && (
              <TrustBadge label="KYC Verified" icon={ShieldCheck} />
            )}
            {(profile.totalProjects ?? profile.completedProjects ?? 0) > 0 && (
              <TrustBadge
                label={`${profile.totalProjects ?? profile.completedProjects} projects`}
                icon={CheckCircle2}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Rating ─────────────────────────────────────────────────────── */}
      {rating > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <StarRating score={rating} />
          <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            ({reviews.length > 0 ? `${reviews.length} recent review${reviews.length !== 1 ? 's' : ''}` : 'no reviews yet'})
          </span>
        </div>
      )}

      {/* ── Categories / Specialisations ───────────────────────────────── */}
      {profile.categories?.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Briefcase className="h-3 w-3" aria-hidden="true" />
            Specialisations
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Service Areas ──────────────────────────────────────────────── */}
      {profile.serviceAreas?.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Service Areas
          </p>
          <p className="text-sm text-foreground">{profile.serviceAreas.join(', ')}</p>
        </div>
      )}

      {/* ── Bio ────────────────────────────────────────────────────────── */}
      {profile.bio && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </p>
          <p className="text-sm leading-relaxed text-foreground">{profile.bio}</p>
        </div>
      )}

      {/* ── Portfolio ──────────────────────────────────────────────────── */}
      {portfolioUrls.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setPortfolioExpanded((v) => !v)}
            className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            aria-expanded={portfolioExpanded}
          >
            Portfolio ({portfolioUrls.length} images)
            {portfolioExpanded
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {portfolioExpanded && (
            <div className="grid grid-cols-3 gap-2">
              {portfolioUrls.slice(0, 9).map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  <Image
                    src={url}
                    alt={`Portfolio image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 150px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Reviews ────────────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setReviewsExpanded((v) => !v)}
            className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            aria-expanded={reviewsExpanded}
          >
            Recent Reviews ({reviews.length})
            {reviewsExpanded
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {reviewsExpanded && (
            <div className="space-y-2">
              {reviews.map((review, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <div className="mb-1 flex items-center gap-2">
                    <StarRating score={review.score} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Platform trust signals ─────────────────────────────────────── */}
      {profile.platformTrustSignals?.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Platform Guarantees
          </p>
          <ul className="space-y-1.5">
            {profile.platformTrustSignals.map((signal) => (
              <li key={signal} className="flex items-start gap-2 text-xs text-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden="true" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
