'use client';

/**
 * WizardShell — manages wizard state with useReducer, persists to localStorage,
 * renders step indicator, progress bar, and navigation.
 */

import { useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  WIZARD_INITIAL_STATE,
  type WizardState,
  type WizardAction,
} from '@/types/project.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 7;
const STORAGE_KEY = 'decoqo_wizard_draft';

const STEP_LABELS = [
  'Space Type',
  'Location',
  'Rooms',
  'Floor Plan',
  'Path',
  'Budget',
  'Review',
] as const;

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_SPACE_TYPE':
      return { ...state, spaceType: action.payload };
    case 'SET_LOCATION':
      return { ...state, ...action.payload };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'SET_FLOOR_PLAN':
      return { ...state, floorPlanFile: action.payload };
    case 'SET_PATH':
      return { ...state, path: action.payload };
    case 'SET_AI_THEME':
      return { ...state, aiTheme: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_BUDGET':
      return { ...state, ...action.payload };
    case 'SET_TIMELINE':
      return { ...state, timeline: action.payload };
    case 'SET_PRIORITY':
      return { ...state, priority: action.payload };
    case 'RESTORE':
      return { ...state, ...action.payload };
    case 'RESET':
      return WIZARD_INITIAL_STATE;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

import { createContext, useContext } from 'react';

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  goNext: () => void;
  goBack: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside WizardShell');
  return ctx;
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

interface StepIndicatorProps {
  currentStep: number;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Wizard progress" className="mb-8">
      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
            background: 'var(--gold-gradient)',
          }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Step ${currentStep} of ${TOTAL_STEPS}`}
        />
      </div>

      {/* Step dots */}
      <ol className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <li key={label} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200',
                  isCompleted
                    ? 'bg-accent text-accent-foreground'
                    : isCurrent
                      ? 'bg-accent/20 text-accent ring-2 ring-accent ring-offset-1 ring-offset-background'
                      : 'bg-muted text-muted-foreground',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={cn(
                  'hidden text-xs sm:block',
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// WizardShell
// ---------------------------------------------------------------------------

interface WizardShellProps {
  children: ReactNode;
  onSaveDraft?: (state: WizardState) => Promise<void>;
  isSaving?: boolean;
}

export function WizardShell({ children, onSaveDraft, isSaving }: WizardShellProps) {
  const [state, dispatch] = useReducer(wizardReducer, WIZARD_INITIAL_STATE);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<WizardState>;
        dispatch({ type: 'RESTORE', payload: parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const goNext = useCallback(() => {
    if (state.step < TOTAL_STEPS) {
      dispatch({ type: 'SET_STEP', payload: state.step + 1 });
    }
  }, [state.step]);

  const goBack = useCallback(() => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', payload: state.step - 1 });
    }
  }, [state.step]);

  const handleSaveDraft = useCallback(async () => {
    if (onSaveDraft) {
      await onSaveDraft(state);
    }
  }, [onSaveDraft, state]);

  const contextValue: WizardContextValue = {
    state,
    dispatch,
    goNext,
    goBack,
    canGoBack: state.step > 1,
    canGoNext: state.step < TOTAL_STEPS,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className="mx-auto max-w-2xl animate-page-in">
        {/* Step indicator */}
        <StepIndicator currentStep={state.step} />

        {/* Step content */}
        <div className="neu-card-3d rounded-2xl p-6 lg:p-8">
          {children}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={!contextValue.canGoBack}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {onSaveDraft && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                Save Draft
              </Button>
            )}

            {state.step < TOTAL_STEPS && (
              <Button
                type="button"
                onClick={goNext}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
}

export { STORAGE_KEY };
