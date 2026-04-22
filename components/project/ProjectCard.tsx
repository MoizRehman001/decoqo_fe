import Link from 'next/link';
import {
  Home,
  Building2,
  Briefcase,
  Factory,
  Package,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectStatusBadge } from '@/components/project/ProjectStatusBadge';
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
  const lakhs = amount / 100000;
  return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const SpaceIcon = SPACE_ICONS[project.spaceType];

  return (
    <article
      className={cn(
        'ivory-card group flex flex-col gap-4 p-5',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Space type icon */}
          <div className="icon-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <SpaceIcon className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground leading-snug">
              {project.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {SPACE_LABELS[project.spaceType]}
            </p>
          </div>
        </div>
        <ProjectStatusBadge status={project.status} className="shrink-0" />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {project.city}, {project.pincode}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formatDate(project.createdAt)}
        </span>
        {project.status === 'BIDDING_OPEN' && project.bidsCount > 0 && (
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {project.bidsCount} bid{project.bidsCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Budget */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="text-sm font-semibold text-foreground">
            {formatBudget(project.budgetMin)} – {formatBudget(project.budgetMax)}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="gap-1.5 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/60 group-hover:border-accent/60"
        >
          <Link href={`/customer/projects/${project.id}`}>
            View Project
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
