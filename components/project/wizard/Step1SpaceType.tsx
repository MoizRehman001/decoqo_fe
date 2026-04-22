'use client';

import { Home, Building2, Briefcase, Factory, Package } from 'lucide-react';
import { useWizard } from './WizardShell';
import { cn } from '@/lib/utils';
import type { SpaceType } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SPACE_OPTIONS: Array<{
  type: SpaceType;
  icon: React.ElementType;
  label: string;
  description: string;
}> = [
  {
    type: 'RESIDENTIAL',
    icon: Home,
    label: 'Residential',
    description: 'Apartments, villas, bungalows',
  },
  {
    type: 'COMMERCIAL',
    icon: Building2,
    label: 'Commercial',
    description: 'Retail stores, showrooms',
  },
  {
    type: 'OFFICE',
    icon: Briefcase,
    label: 'Office',
    description: 'Workspaces, co-working',
  },
  {
    type: 'FACTORY',
    icon: Factory,
    label: 'Factory',
    description: 'Industrial, warehouses',
  },
  {
    type: 'OTHER',
    icon: Package,
    label: 'Other',
    description: 'Hospitality, healthcare, etc.',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Step1SpaceType() {
  const { state, dispatch, goNext } = useWizard();

  const handleSelect = (type: SpaceType) => {
    dispatch({ type: 'SET_SPACE_TYPE', payload: type });
    // Auto-advance after a brief moment
    setTimeout(goNext, 200);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          What type of space are you designing?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the category that best describes your project
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Space type selection"
      >
        {SPACE_OPTIONS.map(({ type, icon: Icon, label, description }) => {
          const isSelected = state.spaceType === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(type)}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                isSelected
                  ? 'border-accent bg-accent/10 shadow-sm'
                  : 'border-border bg-background hover:border-accent/40 hover:bg-accent/5',
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                  isSelected ? 'bg-accent/20' : 'bg-muted',
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isSelected ? 'text-accent' : 'text-muted-foreground',
                  )}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-accent' : 'text-foreground',
                  )}
                >
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
