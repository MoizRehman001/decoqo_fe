/**
 * MaskedMessageWarning — shows ⚠️ badge when contact info was removed.
 * CUST-52: Messages with contact info show [PHONE REMOVED] / [EMAIL REMOVED] with warning badge
 */

import { AlertTriangle } from 'lucide-react';

interface MaskedMessageWarningProps {
  className?: string;
}

export function MaskedMessageWarning({ className }: MaskedMessageWarningProps) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 dark:border-amber-800 dark:bg-amber-950/30 ${className ?? ''}`}
    >
      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" aria-hidden="true" />
      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
        Contact info removed by Decoqo
      </span>
    </div>
  );
}
