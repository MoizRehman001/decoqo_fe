'use client';

/**
 * VendorProfileCard — modal showing anonymized vendor profile.
 * CUST-35: Shows city, categories, portfolio, rating, bio, trust signals
 * CUST-36: NEVER shows phone, email, website, full address
 */

import Image from 'next/image';
import { Star, MapPin, BadgeCheck, Clock, Briefcase, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrustSignals } from '@/components/bidding/TrustSignals';
import { useVendorProfile } from '@/lib/api/bidding';
import { formatInr } from '@/lib/utils/money';
import type { Bid } from '@/types/bidding.types';

interface VendorProfileCardProps {
  bid: Bid;
  open: boolean;
  onClose: () => void;
  onSelect: (bid: Bid) => void;
  isSelecting?: boolean;
}

const MATERIAL_LABELS: Record<string, string> = {
  ECONOMY: 'Economy',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  LUXURY: 'Luxury',
};

const MATERIAL_COLORS: Record<string, string> = {
  ECONOMY: 'hsl(0 0% 50%)',
  STANDARD: 'hsl(217 65% 60%)',
  PREMIUM: 'hsl(40 45% 55%)',
  LUXURY: 'hsl(280 60% 65%)',
};

export function VendorProfileCard({ bid, open, onClose, onSelect, isSelecting }: VendorProfileCardProps) {
  const { data: vendor, isLoading } = useVendorProfile(bid.vendorId, false);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {bid.anonymousLabel} — Vendor Profile
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          </div>
        ) : vendor ? (
          <div className="space-y-5 py-2">
            {/* Header — anonymized */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-bold text-accent font-serif">
                {bid.anonymousLabel.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {bid.anonymousLabel}
                  </h3>
                  {vendor.isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                      KYC Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {vendor.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    {vendor.yearsExperience} yrs experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Responds in ~{vendor.avgResponseHours}h
                  </span>
                </div>
              </div>
            </div>

            {/* Rating + stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                  <span className="font-serif text-xl font-bold text-foreground">{vendor.rating}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{vendor.reviewCount} reviews</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="font-serif text-xl font-bold text-foreground">{vendor.completedProjects}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">Projects done</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div
                  className="font-serif text-base font-bold"
                  style={{ color: MATERIAL_COLORS[bid.materialLevel] }}
                >
                  {MATERIAL_LABELS[bid.materialLevel]}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Material level</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{vendor.bio}</p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Specialisations</h4>
              <div className="flex flex-wrap gap-2">
                {vendor.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {vendor.portfolioItems.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Portfolio</h4>
                <div className="grid grid-cols-3 gap-2">
                  {vendor.portfolioItems.map((item) => (
                    <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src={item.imageUrl}
                        alt={item.caption}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end p-2">
                        <p className="text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 leading-tight">
                          {item.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bid details */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="mb-3 text-sm font-semibold text-foreground">Bid Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Quote</p>
                  <p className="font-semibold text-foreground">{formatInr(bid.quotePaise)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="font-semibold text-foreground">{bid.timelineWeeks} weeks</p>
                </div>
              </div>
              {bid.scopeAssumptions && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Scope Assumptions</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{bid.scopeAssumptions}</p>
                </div>
              )}
              {bid.notes && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Vendor Notes</p>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{bid.notes}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Trust signals */}
            <TrustSignals compact />

            {/* Select CTA */}
            <Button
              onClick={() => onSelect(bid)}
              disabled={isSelecting}
              className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSelecting ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Selecting vendor…</>
              ) : (
                'Select This Vendor'
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Vendor identity will be revealed after selection. This action cannot be undone.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
