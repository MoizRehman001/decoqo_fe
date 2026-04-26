'use client';

/**
 * BoqItemRow — inline-editable BOQ line item with auto-calculated amount.
 * 6.3: Inline editing, auto-calculated amount (quantity × rate)
 *
 * Design principles:
 * - Optimistic updates: amount recalculates instantly on input change
 * - Debounced save: persists to server 600ms after last keystroke
 * - Read-only mode: when BOQ is LOCKED/SUBMITTED/APPROVED
 * - Paise arithmetic: all monetary values stored/sent as paise integers
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatInr, inrToPaise, paiseToInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { BoqItem, BoqItemUnit } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BOQ_UNITS: { value: BoqItemUnit; label: string }[] = [
  { value: 'sqft', label: 'sq.ft' },
  { value: 'sqm', label: 'sq.m' },
  { value: 'rft', label: 'rft' },
  { value: 'nos', label: 'nos' },
  { value: 'kg', label: 'kg' },
  { value: 'ltr', label: 'ltr' },
  { value: 'set', label: 'set' },
  { value: 'lot', label: 'lot' },
];

export const BOQ_CATEGORIES = [
  'FALSE_CEILING',
  'FLOORING',
  'PAINTING',
  'ELECTRICAL',
  'PLUMBING',
  'FURNITURE',
  'PARTITION',
  'DOORS_WINDOWS',
  'MODULAR_KITCHEN',
  'WARDROBE',
  'CIVIL',
  'HVAC',
  'LIGHTING',
  'OTHER',
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  FALSE_CEILING: 'False Ceiling',
  FLOORING: 'Flooring',
  PAINTING: 'Painting',
  ELECTRICAL: 'Electrical',
  PLUMBING: 'Plumbing',
  FURNITURE: 'Furniture',
  PARTITION: 'Partition',
  DOORS_WINDOWS: 'Doors & Windows',
  MODULAR_KITCHEN: 'Modular Kitchen',
  WARDROBE: 'Wardrobe',
  CIVIL: 'Civil Work',
  HVAC: 'HVAC',
  LIGHTING: 'Lighting',
  OTHER: 'Other',
};

// ---------------------------------------------------------------------------
// Inline editable cell
// ---------------------------------------------------------------------------

interface EditableCellProps {
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  min?: number;
  step?: number;
}

function EditableCell({
  value,
  onChange,
  readOnly,
  type = 'text',
  placeholder,
  className,
  min,
  step,
}: EditableCellProps) {
  if (readOnly) {
    return (
      <span className={cn('text-sm text-foreground', className)}>{value || '—'}</span>
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      step={step}
      className={cn(
        'w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-foreground',
        'placeholder:text-muted-foreground/50',
        'hover:border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30',
        'transition-colors duration-150',
        className,
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// BoqItemRow
// ---------------------------------------------------------------------------

export interface BoqItemRowChanges {
  description?: string;
  material?: string;
  brand?: string;
  quantity?: number;
  ratePaise?: number;
  unit?: BoqItemUnit;
  category?: string;
}

interface BoqItemRowProps {
  item: BoqItem;
  readOnly: boolean;
  onUpdate: (itemId: string, changes: BoqItemRowChanges) => void;
  onRemove: (itemId: string) => void;
  isRemoving?: boolean;
}

export function BoqItemRow({ item, readOnly, onUpdate, onRemove, isRemoving }: BoqItemRowProps) {
  // Local state for optimistic display
  const [localQty, setLocalQty] = useState(String(item.quantity));
  const [localRate, setLocalRate] = useState(String(paiseToInr(item.ratePaise)));
  const [localDesc, setLocalDesc] = useState(item.description);
  const [localMaterial, setLocalMaterial] = useState(item.material);
  const [localBrand, setLocalBrand] = useState(item.brand);
  const [localUnit, setLocalUnit] = useState<BoqItemUnit>(item.unit);
  const [localCategory, setLocalCategory] = useState(item.category);
  const [showNotes, setShowNotes] = useState(false);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from parent when item changes (e.g. after server response)
  useEffect(() => {
    setLocalQty(String(item.quantity));
    setLocalRate(String(paiseToInr(item.ratePaise)));
    setLocalDesc(item.description);
    setLocalMaterial(item.material);
    setLocalBrand(item.brand);
    setLocalUnit(item.unit);
    setLocalCategory(item.category);
  }, [item]);

  // Optimistic amount calculation
  const qty = parseFloat(localQty) || 0;
  const rateInr = parseFloat(localRate) || 0;
  const optimisticAmountPaise = Math.round(qty * inrToPaise(rateInr));

  const scheduleUpdate = useCallback(
    (changes: BoqItemRowChanges) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(item.id, changes);
      }, 600);
    },
    [item.id, onUpdate],
  );

  const handleQtyChange = (v: string) => {
    setLocalQty(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) scheduleUpdate({ quantity: n });
  };

  const handleRateChange = (v: string) => {
    setLocalRate(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n >= 0) scheduleUpdate({ ratePaise: inrToPaise(n) });
  };

  const handleDescChange = (v: string) => {
    setLocalDesc(v);
    scheduleUpdate({ description: v });
  };

  const handleMaterialChange = (v: string) => {
    setLocalMaterial(v);
    scheduleUpdate({ material: v });
  };

  const handleBrandChange = (v: string) => {
    setLocalBrand(v);
    scheduleUpdate({ brand: v });
  };

  const handleUnitChange = (v: BoqItemUnit) => {
    setLocalUnit(v);
    onUpdate(item.id, { unit: v });
  };

  const handleCategoryChange = (v: string) => {
    setLocalCategory(v);
    onUpdate(item.id, { category: v });
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border/60 bg-card transition-all duration-150',
        'hover:border-accent/30 hover:shadow-sm',
        isRemoving && 'opacity-50 pointer-events-none',
      )}
    >
      {/* Main row */}
      <div className="flex items-start gap-2 p-3">
        {/* Drag handle (visual only) */}
        {!readOnly && (
          <div className="mt-2 cursor-grab text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0">
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </div>
        )}

        {/* Content grid */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-x-3 gap-y-2 items-start">
          {/* Category — col 3 */}
          <div className="col-span-3">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Category
            </p>
            {readOnly ? (
              <span className="text-sm text-foreground">
                {CATEGORY_LABELS[localCategory] ?? localCategory}
              </span>
            ) : (
              <div className="relative">
                <select
                  value={localCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-transparent bg-transparent py-1 pl-2 pr-6 text-sm text-foreground hover:border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                >
                  {BOQ_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1.5 h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Description — col 5 */}
          <div className="col-span-5">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Description
            </p>
            <EditableCell
              value={localDesc}
              onChange={handleDescChange}
              readOnly={readOnly}
              placeholder="Item description…"
              className="font-medium"
            />
          </div>

          {/* Material — col 4 */}
          <div className="col-span-4">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Material / Brand
            </p>
            <div className="flex gap-1.5">
              <EditableCell
                value={localMaterial}
                onChange={handleMaterialChange}
                readOnly={readOnly}
                placeholder="Material"
                className="flex-1"
              />
              <EditableCell
                value={localBrand}
                onChange={handleBrandChange}
                readOnly={readOnly}
                placeholder="Brand"
                className="flex-1"
              />
            </div>
          </div>

          {/* Qty + Unit — col 3 */}
          <div className="col-span-3">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Qty
            </p>
            <div className="flex items-center gap-1.5">
              <EditableCell
                value={localQty}
                onChange={handleQtyChange}
                readOnly={readOnly}
                type="number"
                min={0}
                step={0.01}
                placeholder="0"
                className="w-20 tabular-nums"
              />
              {readOnly ? (
                <span className="text-xs text-muted-foreground">{localUnit}</span>
              ) : (
                <select
                  value={localUnit}
                  onChange={(e) => handleUnitChange(e.target.value as BoqItemUnit)}
                  className="rounded-lg border border-transparent bg-transparent py-1 pl-1 pr-1 text-xs text-muted-foreground hover:border-border focus:border-accent focus:outline-none transition-colors"
                >
                  {BOQ_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Rate — col 3 */}
          <div className="col-span-3">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Rate / Unit (₹)
            </p>
            <EditableCell
              value={localRate}
              onChange={handleRateChange}
              readOnly={readOnly}
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              className="tabular-nums"
            />
          </div>

          {/* Amount — col 4 (auto-calculated, always read-only) */}
          <div className="col-span-4">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Amount
            </p>
            <p
              className={cn(
                'text-sm font-semibold tabular-nums',
                optimisticAmountPaise > 0 ? 'text-accent' : 'text-muted-foreground',
              )}
            >
              {optimisticAmountPaise > 0 ? formatInr(optimisticAmountPaise) : '—'}
            </p>
          </div>

          {/* Notes toggle — col 2 */}
          {!readOnly && (
            <div className="col-span-2 flex items-end justify-end">
              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                className="text-[10px] text-muted-foreground/60 hover:text-accent transition-colors"
              >
                {showNotes ? 'Hide notes' : '+ Notes'}
              </button>
            </div>
          )}
        </div>

        {/* Remove button */}
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            aria-label="Remove item"
            className="mt-1 h-7 w-7 shrink-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Notes row */}
      {showNotes && !readOnly && (
        <div className="border-t border-border/40 px-3 pb-3 pt-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Notes
          </p>
          <textarea
            defaultValue={item.notes ?? ''}
            onBlur={(e) => onUpdate(item.id, {})}
            rows={2}
            placeholder="Optional notes for this item…"
            className="w-full resize-none rounded-lg border border-border/60 bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>
      )}

      {/* Read-only notes */}
      {readOnly && item.notes && (
        <div className="border-t border-border/40 px-3 pb-3 pt-2">
          <p className="text-xs text-muted-foreground italic">{item.notes}</p>
        </div>
      )}
    </div>
  );
}
