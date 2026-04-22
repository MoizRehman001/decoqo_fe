'use client';

import Link from 'next/link';
import {
  Home, Building2, Briefcase, Factory, Package,
  MapPin, Calendar, Ruler, IndianRupee, Gavel,
  Clock, Shield, Image as ImageIcon,
} from 'lucide-react';
import { ProjectStatusBadge } from '@/components/project/ProjectStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Project, SpaceType } from '@/types/project.types';

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const TIMELINE_LABELS: Record<string, string> = {
  '4_WEEKS': '4 Weeks',
  '6_WEEKS': '6 Weeks',
  '8_WEEKS': '8 Weeks',
  '12_WEEKS': '12 Weeks',
  'FLEXIBLE': 'Flexible',
};

// ---------------------------------------------------------------------------
// Navigation Tabs
// ---------------------------------------------------------------------------

const TABS = [
  { label: 'Overview', href: '' },
  { label: 'Bidding Room', href: '/bidding-room' },
  { label: 'Milestones', href: '/milestones' },
  { label: 'BOQ', href: '/boq' },
  { label: 'Chat', href: '/chat' },
  { label: 'Timeline', href: '/timeline' },
] as const;

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function ProjectOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProjectOverviewProps {
  project: Project;
  activeTab?: string;
}

export function ProjectOverview({ project, activeTab = '' }: ProjectOverviewProps) {
  const SpaceIcon = SPACE_ICONS[project.spaceType];
  const baseHref = `/customer/projects/${project.id}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="icon-container flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <SpaceIcon className="h-6 w-6 text-accent" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground leading-snug">
              {project.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{SPACE_LABELS[project.spaceType]}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {project.city}, {project.pincode}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(project.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <ProjectStatusBadge status={project.status} className="shrink-0" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gavel className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs">Bids Received</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{project.bidsCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs">Budget Range</span>
          </div>
          <p className="mt-2 text-sm font-bold text-foreground">
            {formatBudget(project.budgetMin)} – {formatBudget(project.budgetMax)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs">Timeline</span>
          </div>
          <p className="mt-2 text-sm font-bold text-foreground">
            {TIMELINE_LABELS[project.timeline] ?? project.timeline}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs">Escrow</span>
          </div>
          <p className="mt-2 text-sm font-bold text-foreground">
            {project.status === 'IN_PROGRESS' || project.status === 'COMPLETED'
              ? 'Active'
              : 'Pending'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        className="border-b border-border"
        aria-label="Project sections"
      >
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map(({ label, href }) => {
            const isActive = activeTab === href;
            return (
              <Link
                key={label}
                href={`${baseHref}${href}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main details */}
        <div className="space-y-5 lg:col-span-2">
          {/* Rooms */}
          <div className="ivory-card rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">
                Rooms ({project.rooms.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {project.rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-foreground">{room.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {room.lengthFt} × {room.widthFt} × {room.heightFt} ft
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="ivory-card rounded-xl p-5">
              <h2 className="mb-2 text-sm font-semibold text-foreground">Description</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Design / Floor Plan */}
          {(project.aiDesignPath || project.floorPlanPath) && (
            <div className="ivory-card overflow-hidden rounded-xl">
              <div className="flex h-40 items-center justify-center bg-muted">
                <ImageIcon className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
              </div>
              <div className="p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  {project.aiDesignPath ? 'AI Design Preview' : 'Floor Plan'}
                </p>
              </div>
            </div>
          )}

          {/* Project details */}
          <div className="ivory-card rounded-xl p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Project Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Path</span>
                <span className="font-medium text-foreground">
                  {project.path === 'AI_DESIGN' ? 'AI Design' : 'Direct Bidding'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium text-foreground capitalize">
                  {project.priority.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flexibility</span>
                <span className="font-medium text-foreground capitalize">
                  {project.budgetFlexibility.replace('_', ' ').toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
