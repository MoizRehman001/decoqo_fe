'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, IndianRupee, Clock, Home,
  CheckCircle2, AlertCircle, ShieldAlert,
} from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import { Button } from '@/components/ui/button';
import { BidSubmitForm } from '@/components/bidding/BidSubmitForm';
import { ProjectStatusBadge } from '@/components/project/ProjectStatusBadge';
import { useProject } from '@/lib/api/projects';
import { useVendorKycStatus } from '@/lib/api/users';
import { formatInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Skeleton fixture — mirrors the real layout for bone capture
// ---------------------------------------------------------------------------

function ProjectDetailFixture() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-8 w-2/3 rounded-lg bg-muted" />
          <div className="h-4 w-1/4 rounded-md bg-muted" />
        </div>
        <div className="h-6 w-24 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ivory-card rounded-xl p-4 space-y-2">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="ivory-card rounded-xl p-5 space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
      <div className="ivory-card rounded-xl p-5 space-y-3">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-48 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="ivory-card rounded-xl p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VendorProjectDetailPage() {
  const params  = useParams<{ projectId: string }>();
  const router  = useRouter();
  const projectId = params.projectId;

  const [bidSubmitted, setBidSubmitted] = useState(false);

  const { data: project, isLoading, isError } = useProject(projectId);
  const { data: kycData } = useVendorKycStatus();

  // KYC status from backend
  const kycStatus = (kycData as { kycStatus?: string } | null)?.kycStatus ?? 'NOT_STARTED';
  const isApproved = (kycData as { isApproved?: boolean } | null)?.isApproved ?? false;
  const kycApproved = isApproved && kycStatus === 'APPROVED';

  // ── Bid success ────────────────────────────────────────────────────────────
  if (bidSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-page-in">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-xl font-semibold text-foreground">Bid submitted!</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your bid has been submitted anonymously. You&apos;ll be notified if the customer shortlists or selects you.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => router.push('/vendor/bids')}>
            View My Bids
          </Button>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => router.push('/vendor/projects')}
          >
            Browse More Projects
          </Button>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-page-in">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-xl font-semibold text-foreground">Project not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This project may have been removed or is no longer available.
        </p>
        <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/vendor/projects">Browse Projects</Link>
        </Button>
      </div>
    );
  }

  const isBiddingOpen = project?.status === 'BIDDING_OPEN';

  return (
    <div className="space-y-6 animate-page-in">
      {/* Back / breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/vendor/projects" className="hover:text-foreground transition-colors">
            Browse Projects
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="inline-block max-w-[200px] truncate align-bottom font-medium text-foreground">
            {project?.title ?? '…'}
          </span>
        </nav>
      </div>

      {/* Boneyard skeleton wraps the entire content */}
      <Skeleton
        name="vendor-project-detail"
        loading={isLoading}
        animate="shimmer"
        transition={300}
        fixture={<ProjectDetailFixture />}
      >
        {project && (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-2xl font-semibold leading-tight text-foreground">
                  {project.title}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {project.city}
                  {project.pincode && (
                    <span className="text-muted-foreground/60">· {project.pincode}</span>
                  )}
                </div>
              </div>
              <ProjectStatusBadge status={project.status} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Budget Range"
                value={`${formatInr(project.budgetMin ?? 0)} – ${formatInr(project.budgetMax ?? 0)}`}
                icon={IndianRupee}
              />
              <StatCard
                label="Timeline"
                value={project.timelineWeeks ? `${project.timelineWeeks} weeks` : '—'}
                icon={Clock}
              />
              <StatCard
                label="Space Type"
                value={project.spaceType?.replace(/_/g, ' ') ?? '—'}
                icon={Home}
              />
              <StatCard
                label="Bids Received"
                value={`${project.bidsCount ?? 0} bid${(project.bidsCount ?? 0) !== 1 ? 's' : ''}`}
                icon={CheckCircle2}
              />
            </div>

            {/* Description */}
            {project.description && (
              <div className="ivory-card rounded-xl p-5">
                <h2 className="mb-2 text-sm font-semibold text-foreground">Project Description</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
              </div>
            )}

            {/* Rooms */}
            {project.rooms && project.rooms.length > 0 && (
              <div className="ivory-card rounded-xl p-5">
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Rooms ({project.rooms.length})
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {project.rooms.map((room) => (
                    <div key={room.id} className="rounded-lg border border-border bg-background px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{room.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {room.lengthCm && room.widthCm
                          ? `${Math.round(room.lengthCm / 30.48)} × ${Math.round(room.widthCm / 30.48)} ft`
                          : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget details */}
            <div className="ivory-card rounded-xl p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Budget Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Flexibility</span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      project.budgetFlexibility === 'STRICT'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                        : project.budgetFlexibility === 'FLEXIBLE_10'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                    )}
                  >
                    {project.budgetFlexibility?.replace(/_/g, ' ') ?? '—'}
                  </span>
                </div>
                {project.priorityMode && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="font-medium text-foreground">
                      {project.priorityMode.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bid form or status message */}
            <div className="ivory-card rounded-xl p-5">
              {isBiddingOpen ? (
                <>
                  <h2 className="mb-1 font-serif text-lg font-semibold text-foreground">
                    Submit Your Bid
                  </h2>
                  <p className="mb-5 text-sm text-muted-foreground">
                    Your identity remains anonymous until the customer selects you.
                  </p>

                  {/* KYC gate — show wall if not approved */}
                  {!kycApproved ? (
                    <div className="flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center dark:border-amber-800 dark:bg-amber-950/20">
                      <ShieldAlert className="mb-3 h-10 w-10 text-amber-500" aria-hidden="true" />
                      <h3 className="font-serif text-base font-semibold text-foreground">
                        KYC Verification Required
                      </h3>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        {kycStatus === 'NOT_STARTED'
                          ? 'Complete your KYC verification to submit bids. It takes 1–2 business days.'
                          : kycStatus === 'PENDING'
                          ? 'Your KYC is under review. You can submit bids once admin approves it (1–2 business days).'
                          : kycStatus === 'REJECTED'
                          ? 'Your KYC was rejected. Please resubmit with correct documents.'
                          : 'Please complete your KYC to submit bids.'}
                      </p>
                      <Button
                        asChild
                        className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Link href="/vendor/kyc">
                          {kycStatus === 'NOT_STARTED' ? 'Complete KYC →' : 'View KYC Status →'}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <BidSubmitForm
                      projectId={project.id}
                      projectRooms={project.rooms?.map((r) => r.name) ?? []}
                      onSuccess={() => setBidSubmitted(true)}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="font-medium text-foreground">Bidding is not open</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This project is currently{' '}
                    <strong>{project.status.replace(/_/g, ' ').toLowerCase()}</strong> and is not
                    accepting bids.
                  </p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/vendor/projects">Browse Open Projects</Link>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Skeleton>
    </div>
  );
}
