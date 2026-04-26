'use client';

/**
 * AddItemDialog — modal form to add a new BOQ line item.
 * Used by BoqEditor when vendor clicks "Add item to [room]".
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inrToPaise } from '@/lib/utils/money';
import { BOQ_UNITS, BOQ_CATEGORIES } from '@/components/boq/BoqItemRow';
import type { BoqItemUnit } from '@/types/boq.types';
import type { AddBoqItemPayload } from '@/types/boq.types';

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

interface AddItemDialogProps {
  open: boolean;
  defaultRoom: string;
  boqId: string;
  onClose: () => void;
  onAdd: (payload: AddBoqItemPayload) => Promise<void>;
}

interface FormState {
  room: string;
  category: string;
  description: string;
  material: string;
  brand: string;
  quantity: string;
  unit: BoqItemUnit;
  rateInr: string;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  room: '',
  category: 'OTHER',
  description: '',
  material: '',
  brand: '',
  quantity: '',
  unit: 'nos',
  rateInr: '',
  notes: '',
};

export function AddItemDialog({ open, defaultRoom, boqId, onClose, onAdd }: AddItemDialogProps) {
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM, room: defaultRoom });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const qty = parseFloat(form.quantity) || 0;
  const rateInr = parseFloat(form.rateInr) || 0;
  const previewAmount = qty * rateInr;

  const isValid =
    form.room.trim() &&
    form.description.trim() &&
    qty > 0 &&
    rateInr >= 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd({
        boqId,
        room: form.room.trim(),
        category: form.category,
        description: form.description.trim(),
        material: form.material.trim(),
        brand: form.brand.trim(),
        quantity: qty,
        unit: form.unit,
        ratePaise: inrToPaise(rateInr),
        notes: form.notes.trim() || undefined,
      });
      setForm({ ...DEFAULT_FORM, room: defaultRoom });
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setForm({ ...DEFAULT_FORM, room: defaultRoom });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Add BOQ Item</DialogTitle>
          <DialogDescription>
            Add a new line item to the Bill of Quantities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Room */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Room <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.room}
              onChange={(e) => set('room')(e.target.value)}
              placeholder="e.g. Living Room, Kitchen…"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category')(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {BOQ_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="e.g. Gypsum false ceiling with cove lighting"
            />
          </div>

          {/* Material + Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Material</label>
              <Input
                value={form.material}
                onChange={(e) => set('material')(e.target.value)}
                placeholder="e.g. Gypsum Board 12.5mm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Brand</label>
              <Input
                value={form.brand}
                onChange={(e) => set('brand')(e.target.value)}
                placeholder="e.g. Saint-Gobain"
              />
            </div>
          </div>

          {/* Qty + Unit + Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Quantity <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.quantity}
                onChange={(e) => set('quantity')(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => set('unit')(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {BOQ_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Rate / Unit (₹) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.rateInr}
                onChange={(e) => set('rateInr')(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Amount preview */}
          {previewAmount > 0 && (
            <div className="rounded-xl bg-accent/5 border border-accent/20 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calculated Amount</span>
              <span className="font-serif text-lg font-bold text-accent tabular-nums">
                ₹{previewAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes')(e.target.value)}
              rows={2}
              placeholder="Any additional notes for this item…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
