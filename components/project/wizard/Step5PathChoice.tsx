'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWizard } from './WizardShell';
import { cn } from '@/lib/utils';
import type { WizardPath } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Step5PathChoice() {
  const { state, dispatch, goNext } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleSelectPath = (path: WizardPath) => {
    dispatch({ type: 'SET_PATH', payload: path });
    setError(null);
  };

  const handleContinue = () => {
    if (!state.path) {
      setError('Please select a path to continue.');
      return;
    }
    if (state.path === 'BIDDING' && state.description.trim().length < 50) {
      setError('Please provide a description of at least 50 characters.');
      return;
    }
    goNext();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          How would you like to proceed?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your preferred path to get started
        </p>
      </div>

      {/* Path cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* AI Design Path */}
        <button
          type="button"
          role="radio"
          aria-checked={state.path === 'AI_DESIGN'}
          onClick={() => handleSelectPath('AI_DESIGN')}
          className={cn(
            'flex flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
            state.path === 'AI_DESIGN'
              ? 'border-accent bg-accent/10'
              : 'border-border bg-background hover:border-accent/40 hover:bg-accent/5',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
            <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Generate AI Designs ✨</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Get AI-generated design concepts before inviting vendor bids
            </p>
          </div>
          {state.path === 'AI_DESIGN' && (
            <span className="self-start rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
              Selected
            </span>
          )}
        </button>

        {/* Bidding Path */}
        <button
          type="button"
          role="radio"
          aria-checked={state.path === 'BIDDING'}
          onClick={() => handleSelectPath('BIDDING')}
          className={cn(
            'flex flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
            state.path === 'BIDDING'
              ? 'border-accent bg-accent/10'
              : 'border-border bg-background hover:border-accent/40 hover:bg-accent/5',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <ArrowRight className="h-6 w-6 text-blue-500" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Skip to Bidding →</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Directly invite verified vendors to bid on your project
            </p>
          </div>
          {state.path === 'BIDDING' && (
            <span className="self-start rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
              Selected
            </span>
          )}
        </button>
      </div>

      {/* Conditional fields */}
      {state.path === 'AI_DESIGN' && (
        <div className="mt-5 space-y-4">
          <div
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(38 60% 55% / 0.3), transparent)' }}
            aria-hidden="true"
          />
          <div>
            <label htmlFor="ai-theme" className="mb-1.5 block text-sm font-medium text-foreground">
              Design Theme / Style
            </label>
            <Input
              id="ai-theme"
              type="text"
              placeholder="e.g. Modern minimalist with warm tones, Scandinavian..."
              value={state.aiTheme}
              onChange={(e) => dispatch({ type: 'SET_AI_THEME', payload: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Describe your preferred aesthetic to guide the AI
            </p>
          </div>
        </div>
      )}

      {state.path === 'BIDDING' && (
        <div className="mt-5 space-y-4">
          <div
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(38 60% 55% / 0.3), transparent)' }}
            aria-hidden="true"
          />
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
              Project Description{' '}
              <span className="text-xs font-normal text-muted-foreground">(min. 50 characters)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe your project requirements, style preferences, materials, and any specific needs..."
              value={state.description}
              onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'resize-none',
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {state.description.length}/50 characters minimum
            </p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!state.path}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Continue
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
