'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWizard } from './WizardShell';
import { cn } from '@/lib/utils';
import type { BudgetFlexibility, ProjectTimeline, ProjectPriority } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FLEXIBILITY_OPTIONS: Array<{ value: BudgetFlexibility; label: string; description: string }> = [
  { value: 'STRICT', label: 'Strict', description: 'No budget overruns' },
  { value: 'FLEXIBLE', label: 'Flexible', description: 'Up to 10% variance' },
  { value: 'VERY_FLEXIBLE', label: 'Very Flexible', description: 'Open to discussion' },
];

const TIMELINE_OPTIONS: Array<{ value: ProjectTimeline; label: string }> = [
  { value: '4_WEEKS', label: '4 Weeks' },
  { value: '6_WEEKS', label: '6 Weeks' },
  { value: '8_WEEKS', label: '8 Weeks' },
  { value: '12_WEEKS', label: '12 Weeks' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

const PRIORITY_OPTIONS: Array<{ value: ProjectPriority; label: string; description: string }> = [
  { value: 'QUALITY_FIRST', label: 'Quality First', description: 'Best materials & craftsmanship' },
  { value: 'SPEED_FIRST', label: 'Speed First', description: 'Fastest completion time' },
  { value: 'BUDGET_FIRST', label: 'Budget First', description: 'Most cost-effective' },
];

function formatLakhs(amount: number): string {
  return `₹${(amount / 100000).toFixed(1)}L`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Step6Budget() {
  const { state, dispatch, goNext } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (state.budgetMax <= 0) {
      setError('Please enter a maximum budget.');
      return;
    }
    if (state.budgetMin > 0 && state.budgetMin >= state.budgetMax) {
      setError('Maximum budget must be greater than minimum budget.');
      return;
    }
    goNext();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Budget & timeline
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Help vendors understand your expectations
        </p>
      </div>

      <div className="space-y-6">
        {/* Budget Range */}
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Budget Range (INR)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget-min" className="mb-1 block text-xs text-muted-foreground">
                Minimum
              </label>
              <Input
                id="budget-min"
                type="number"
                inputMode="numeric"
                min={0}
                step={10000}
                value={state.budgetMin || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_BUDGET',
                    payload: {
                      budgetMin: parseInt(e.target.value) || 0,
                      budgetMax: state.budgetMax,
                      budgetFlexibility: state.budgetFlexibility,
                    },
                  })
                }
                placeholder="0 (no minimum)"
              />
              {state.budgetMin > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">{formatLakhs(state.budgetMin)}</p>
              )}
            </div>
            <div>
              <label htmlFor="budget-max" className="mb-1 block text-xs text-muted-foreground">
                Maximum
              </label>
              <Input
                id="budget-max"
                type="number"
                inputMode="numeric"
                min={0}
                step={10000}
                value={state.budgetMax || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_BUDGET',
                    payload: {
                      budgetMin: state.budgetMin,
                      budgetMax: parseInt(e.target.value) || 0,
                      budgetFlexibility: state.budgetFlexibility,
                    },
                  })
                }
                placeholder="Any"
              />
              {state.budgetMax > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">{formatLakhs(state.budgetMax)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Budget Flexibility */}
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Budget Flexibility</p>
          <div className="grid grid-cols-3 gap-2">
            {FLEXIBILITY_OPTIONS.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={state.budgetFlexibility === value}
                onClick={() =>
                  dispatch({
                    type: 'SET_BUDGET',
                    payload: {
                      budgetMin: state.budgetMin,
                      budgetMax: state.budgetMax,
                      budgetFlexibility: value,
                    },
                  })
                }
                className={cn(
                  'flex flex-col gap-1 rounded-xl border p-3 text-left transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                  state.budgetFlexibility === value
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-background hover:border-accent/40',
                )}
              >
                <span className={cn('text-sm font-medium', state.budgetFlexibility === value ? 'text-accent' : 'text-foreground')}>
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="mb-2 block text-sm font-medium text-foreground">
            Expected Timeline
          </label>
          <select
            id="timeline"
            value={state.timeline}
            onChange={(e) => dispatch({ type: 'SET_TIMELINE', payload: e.target.value as ProjectTimeline })}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            {TIMELINE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Project Priority</p>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_OPTIONS.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={state.priority === value}
                onClick={() => dispatch({ type: 'SET_PRIORITY', payload: value })}
                className={cn(
                  'flex flex-col gap-1 rounded-xl border p-3 text-left transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                  state.priority === value
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-background hover:border-accent/40',
                )}
              >
                <span className={cn('text-sm font-medium', state.priority === value ? 'text-accent' : 'text-foreground')}>
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Continue
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
