'use client';

import { WizardShell } from '@/components/project/wizard/WizardShell';
import { Step1SpaceType } from '@/components/project/wizard/Step1SpaceType';
import { Step2Location } from '@/components/project/wizard/Step2Location';
import { Step3Rooms } from '@/components/project/wizard/Step3Rooms';
import { Step4FloorPlan } from '@/components/project/wizard/Step4FloorPlan';
import { Step5PathChoice } from '@/components/project/wizard/Step5PathChoice';
import { Step6Budget } from '@/components/project/wizard/Step6Budget';
import { Step7Review } from '@/components/project/wizard/Step7Review';
import { useWizard } from '@/components/project/wizard/WizardShell';

// ---------------------------------------------------------------------------
// Step renderer — reads step from wizard context
// ---------------------------------------------------------------------------

function WizardStepRenderer() {
  const { state } = useWizard();

  switch (state.step) {
    case 1:
      return <Step1SpaceType />;
    case 2:
      return <Step2Location />;
    case 3:
      return <Step3Rooms />;
    case 4:
      return <Step4FloorPlan />;
    case 5:
      return <Step5PathChoice />;
    case 6:
      return <Step6Budget />;
    case 7:
      return <Step7Review />;
    default:
      return <Step1SpaceType />;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewProjectPage() {
  return (
    <div className="py-4">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Create New Project
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your space and we&apos;ll connect you with the right vendors
        </p>
      </div>

      <WizardShell>
        <WizardStepRenderer />
      </WizardShell>
    </div>
  );
}
