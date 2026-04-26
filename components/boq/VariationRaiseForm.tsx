'use client';

/**
 * VariationRaiseForm — vendor raises a variation order against a locked BOQ.
 * 6.9: Variation raise form (vendor side)
 *
 * A variation is a formal change request after the BOQ is locked.
 * It specifies which items changed, old vs new values, and a reason.
 */

import { useState } from 'react';
import { Plus, Trash2, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatInr, inrToPaise, paiseToInr } from '@/lib/utils/money';
import { useRaiseVariation } from '@/lib/api/boq';
import type { Boq, BoqItem, VariationType } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AffectedItemForm {
  itemId: string;
  description: string;
  oldRatePaise: number;
  newRateInr: string;
  oldQuantity: number;
  newQuantity: string;
}

interface VariationRaiseFormProps {
  boq: Boq;
  projectId: string;
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VariationRaiseForm({ boq, projectId, open, onClose }: VariationRaiseFormProps) {
  const raiseVariationMutation = useRaiseVariation();

  const [variationType, setVariationType] = useState<VariationType>('POSITIVE');
  const [reason, setReason] = useState('');
  const [affectedItems, setAffectedItems] = useState<AffectedItemForm[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addItem = (item: BoqItem) => {
    if (affectedItems.some((a) => a.itemId === item.id)) return;
    setAffectedItems((prev) => [
      ...prev,
      {
        itemId: item.id,
        description: item.description,
        oldRatePaise: item.ratePaise,
        newRateInr: String(paiseToInr(item.ratePaise)),
        oldQuantity: item.quantity,
        newQuantity: String(item.quantity),
      },
    ]);
  };

  const removeItem = (itemId: string) => {
    setAffectedItems((prev) => prev.filter((a) => a.itemId !== itemId));
  };

  const updateItem = (itemId: string, field: 'newRateInr' | 'newQuantity', value: string) => {
    setAffectedItems((prev) =>
      prev.map((a) => (a.itemId === itemId ? { ...a, [field]: value } : a)),
    );
  };

  // Calculate net delta for preview
  const netDelta = affectedItems.reduce((sum, a) => {
    const oldAmt = a.oldRatePaise * a.oldQuantity;
    const newRate = inrToPaise(parseFloat(a.newRateInr) || 0);
    const newQty = parseFloat(a.newQuantity) || 0;
    const newAmt = newRate * newQty;
    return sum + (newAmt - oldAmt);
  }, 0);

  const isValid =
    reason.trim().length > 0 &&
    affectedItems.length > 0 &&
    affectedItems.every(
      (a) =>
        (parseFloat(a.newRateInr) || 0) >= 0 &&
        (parseFloat(a.newQuantity) || 0) > 0,
    );

  const handleSubmit = async () => {
    if (!isValid) return;
    setError(null);
    try {
      await raiseVariationMutation.mutateAsync({
        boqId: boq.id,
        projectId,
        type: variationType,
        reason: reason.trim(),
        affectedItems: affectedItems.map((a) => ({
          itemId: a.itemId,
          description: a.description,
          oldRatePaise: a.oldRatePaise,
          newRatePaise: inrToPaise(parseFloat(a.newRateInr) || 0),
          oldQuantity: a.oldQuantity,
          newQuantity: parseFloat(a.newQuantity) || 0,
        })),
      });
      // Reset
      setReason('');
      setAffectedItems([]);
      setVariationType('POSITIVE');
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'Failed to raise variation. Please try again.');
    }
  };

  const handleClose = () => {
    setReason('');
    setAffectedItems([]);
    setVariationType('POSITIVE');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Raise Variation Order</DialogTitle>
          <DialogDescription>
            A variation is a formal change to the locked BOQ. The customer must approve it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Type selector */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Variation Type</p>
            <div className="grid grid-cols-2 gap-3">
              {(['POSITIVE', 'NEGATIVE'] as VariationType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVariationType(type)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                    variationType === type
                      ? type === 'POSITIVE'
                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                        : 'border-emerald-400/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {type === 'POSITIVE' ? (
                    <TrendingUp className="h-4 w-4 shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {type === 'POSITIVE' ? 'Cost Increase' : 'Cost Reduction'}
                    </p>
                    <p className="text-xs opacity-70">
                      {type === 'POSITIVE'
                        ? 'Additional scope or material upgrade'
                        : 'Scope reduction or material downgrade'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Explain why this variation is needed…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Select items to modify */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Select Items to Modify <span className="text-destructive">*</span>
            </p>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-border divide-y divide-border/50">
              {boq.items.map((item) => {
                const isAdded = affectedItems.some((a) => a.itemId === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => (isAdded ? removeItem(item.id) : addItem(item))}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                      isAdded
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.room} · {item.quantity} {item.unit} @ {formatInr(item.ratePaise)}
                      </p>
                    </div>
                    <span className="ml-3 shrink-0 text-xs font-semibold">
                      {isAdded ? '✓ Added' : '+ Add'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit affected items */}
          {affectedItems.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">New Values</p>
              {affectedItems.map((a) => {
                const newRate = inrToPaise(parseFloat(a.newRateInr) || 0);
                const newQty = parseFloat(a.newQuantity) || 0;
                const oldAmt = a.oldRatePaise * a.oldQuantity;
                const newAmt = newRate * newQty;
                const delta = newAmt - oldAmt;

                return (
                  <div key={a.itemId} className="rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{a.description}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(a.itemId)}
                        className="h-6 w-6 text-muted-foreground/50 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">
                          New Quantity (was {a.oldQuantity})
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={a.newQuantity}
                          onChange={(e) => updateItem(a.itemId, 'newQuantity', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">
                          New Rate ₹ (was {formatInr(a.oldRatePaise)})
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={a.newRateInr}
                          onChange={(e) => updateItem(a.itemId, 'newRateInr', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    {delta !== 0 && (
                      <p
                        className={`mt-2 text-xs font-semibold tabular-nums ${
                          delta > 0 ? 'text-destructive' : 'text-emerald-500'
                        }`}
                      >
                        {delta > 0 ? '+' : ''}{formatInr(delta)} change for this item
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Net delta preview */}
          {affectedItems.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Net BOQ Change</span>
              <span
                className={`font-serif text-xl font-bold tabular-nums ${
                  netDelta > 0 ? 'text-destructive' : netDelta < 0 ? 'text-emerald-500' : 'text-muted-foreground'
                }`}
              >
                {netDelta === 0 ? 'No change' : `${netDelta > 0 ? '+' : ''}${formatInr(netDelta)}`}
              </span>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={raiseVariationMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || raiseVariationMutation.isPending}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {raiseVariationMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Raise Variation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
