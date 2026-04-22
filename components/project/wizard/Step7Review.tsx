'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Building2, Briefcase, Factory, Package,
  MapPin, Ruler, Sparkles, ArrowRight, IndianRupee,
  Clock, Loader2, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard, STORAGE_KEY } from './WizardShell';
import { mockProjectApi } from '@/mock/mockData';
import { cn } from '@/lib/utils';
import type { SpaceType } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SPACE_ICONS: Record<SpaceType, React.ElementType> = {
  RESIDENTIAL: Home,
  COMMERCIAL: Building2,
  OFFICE: Briefcase,
  FACTORY: Factory,
  OTHER: Package,
};

const SPACE_LABELS: Record<SpaceType, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  OFFICE: 'Office',
  FACTORY: 'Factory',
  OTHER: 'Other',
};

function formatBudget(amount: number): string {
  return `₹${(amount / 100000).toFixed(1)}L`;
}

const TIMELINE_LABELS: Record<string, string> = {
  '4_WEEKS': '4 Weeks',
  '6_WEEKS': '6 Weeks',
  '8_WEEKS': '8 Weeks',
  '12_WEEKS': '12 Weeks',
  'FLEXIBLE': 'Flexible',
};

const PRIORITY_LABELS: Record<string, string> = {
  'QUALITY_FIRST': 'Quality First',
  'SPEED_FIRST': 'Speed First',
  'BUDGET_FIRST': 'Budget First',
};

const FLEXIBILITY_LABELS: Record<string, string> = {
  'STRICT': 'Strict',
  'FLEXIBLE': 'Flexible',
  'VERY_FLEXIBLE': 'Very Flexible',
};

// ---------------------------------------------------------------------------
// Review Row
// ---------------------------------------------------------------------------

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Step7Review() {
  const { state } = useWizard();
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const validationErrors: string[] = [];
  if (!state.spaceType) validationErrors.push('Space type is required');
  if (!state.title) validationErrors.push('Project title is required');
  if (!state.city) validationErrors.push('City is required');
  if (!state.pincode) validationErrors.push('Pincode is required');
  if (state.rooms.length === 0) validationErrors.push('At least one room is required');
  if (!state.path) validationErrors.push('Project path is required');
  if (state.budgetMin <= 0 || state.budgetMax <= 0) validationErrors.push('Budget range is required');

  const SpaceIcon = state.spaceType ? SPACE_ICONS[state.spaceType] : Home;

  const handlePublish = async () => {
    if (validationErrors.length > 0) {
      setError('Please complete all required steps before publishing.');
      return;
    }
    setIsPublishing(true);
    setError(null);
    try {
      const project = await mockProjectApi.createProject({
        title: state.title,
        spaceType: state.spaceType!,
        city: state.city,
        pincode: state.pincode,
        rooms: state.rooms,
        budgetMin: state.budgetMin,
        budgetMax: state.budgetMax,
        budgetFlexibility: state.budgetFlexibility,
        timeline: state.timeline,
        priority: state.priority,
        description: state.description,
        path: state.path!,
        aiTheme: state.aiTheme || undefined,
        floorPlanPath: state.floorPlanFile || undefined,
      });

      // Publish it
      const published = await mockProjectApi.publishProject(project.id);

      // Clear draft from localStorage
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

      router.push(`/customer/projects/${published.id}/bidding-room`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? 'Failed to publish project. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Review & Publish
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your project details before publishing to vendors
        </p>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="mb-2 text-sm font-medium text-destructive">Please complete the following:</p>
          <ul className="list-inside list-disc space-y-1">
            {validationErrors.map((e) => (
              <li key={e} className="text-xs text-destructive">{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-4">
        {/* Project header */}
        {state.spaceType && state.title && (
          <div className="flex items-center gap-3 rounded-xl bg-accent/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
              <SpaceIcon className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{state.title}</p>
              <p className="text-xs text-muted-foreground">{SPACE_LABELS[state.spaceType]}</p>
            </div>
          </div>
        )}

        {/* Location */}
        {(state.city || state.pincode) && (
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Location</span>
            </div>
            <div className="divide-y divide-border">
              {state.city && <ReviewRow label="City" value={state.city} />}
              {state.pincode && <ReviewRow label="Pincode" value={state.pincode} />}
            </div>
          </div>
        )}

        {/* Rooms */}
        {state.rooms.length > 0 && (
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">
                Rooms ({state.rooms.length})
              </span>
            </div>
            <div className="space-y-1">
              {state.rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">{room.name}</span>
                  <span className="text-xs text-foreground">
                    {room.lengthFt}×{room.widthFt}×{room.heightFt} ft
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Path */}
        {state.path && (
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2">
              {state.path === 'AI_DESIGN' ? (
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4 text-blue-500" aria-hidden="true" />
              )}
              <span className="text-sm font-medium text-foreground">
                {state.path === 'AI_DESIGN' ? 'AI Design Path' : 'Direct Bidding'}
              </span>
            </div>
            {state.path === 'AI_DESIGN' && state.aiTheme && (
              <p className="text-sm text-muted-foreground">{state.aiTheme}</p>
            )}
            {state.path === 'BIDDING' && state.description && (
              <p className="line-clamp-3 text-sm text-muted-foreground">{state.description}</p>
            )}
          </div>
        )}

        {/* Budget */}
        {(state.budgetMin > 0 || state.budgetMax > 0) && (
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Budget</span>
            </div>
            <div className="divide-y divide-border">
              <ReviewRow
                label="Range"
                value={`${formatBudget(state.budgetMin)} – ${formatBudget(state.budgetMax)}`}
              />
              <ReviewRow label="Flexibility" value={FLEXIBILITY_LABELS[state.budgetFlexibility] ?? state.budgetFlexibility} />
            </div>
          </div>
        )}

        {/* Timeline & Priority */}
        <div className="rounded-xl border border-border p-4">
          <div className="divide-y divide-border">
            <div className="flex items-center gap-2 pb-2">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Timeline & Priority</span>
            </div>
            <ReviewRow label="Timeline" value={TIMELINE_LABELS[state.timeline] ?? state.timeline} />
            <ReviewRow label="Priority" value={PRIORITY_LABELS[state.priority] ?? state.priority} />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>
      )}

      {/* Publish button */}
      <div className="mt-8">
        <Button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing || validationErrors.length > 0}
          className={cn(
            'w-full gap-2 text-base',
            validationErrors.length === 0
              ? 'bg-accent text-accent-foreground hover:bg-accent/90'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Publishing…
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" aria-hidden="true" />
              Publish Project
            </>
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Your project will be visible to verified vendors immediately
        </p>
      </div>
    </div>
  );
}
