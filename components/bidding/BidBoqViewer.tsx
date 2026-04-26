'use client';

/**
 * BidBoqViewer — customer-facing read-only BOQ breakdown for a bid.
 *
 * Groups line items by room, then by category within each room.
 * Shows subtotals per room and a grand total.
 * Vendor identity is NEVER shown — only anonymous label.
 */

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, IndianRupee } from 'lucide-react';
import { formatInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { BidBoqItem } from '@/types/bidding.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoomGroup {
  room: string;
  categories: CategoryGroup[];
  subtotal: number;
}

interface CategoryGroup {
  category: string;
  items: BidBoqItem[];
  subtotal: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByRoom(items: BidBoqItem[]): RoomGroup[] {
  const roomMap = new Map<string, Map<string, BidBoqItem[]>>();

  for (const item of items) {
    if (!roomMap.has(item.room)) roomMap.set(item.room, new Map());
    const catMap = roomMap.get(item.room)!;
    if (!catMap.has(item.category)) catMap.set(item.category, []);
    catMap.get(item.category)!.push(item);
  }

  return Array.from(roomMap.entries()).map(([room, catMap]) => {
    const categories: CategoryGroup[] = Array.from(catMap.entries()).map(([category, catItems]) => ({
      category,
      items: catItems,
      subtotal: catItems.reduce((s, it) => s + it.amountInr, 0),
    }));
    return {
      room,
      categories,
      subtotal: categories.reduce((s, c) => s + c.subtotal, 0),
    };
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ItemRow({ item }: { item: BidBoqItem }) {
  return (
    <tr className="border-t border-border/50">
      <td className="py-2 pr-3 text-sm text-foreground">{item.description}</td>
      <td className="py-2 pr-3 text-xs text-muted-foreground">
        {[item.material, item.brand].filter(Boolean).join(' · ') || '—'}
      </td>
      <td className="py-2 pr-3 text-right text-sm tabular-nums text-foreground">
        {item.quantity} {item.unit}
      </td>
      <td className="py-2 pr-3 text-right text-sm tabular-nums text-foreground">
        {formatInr(item.rateInr)}
      </td>
      <td className="py-2 text-right text-sm font-medium tabular-nums text-foreground">
        {formatInr(item.amountInr)}
      </td>
    </tr>
  );
}

function CategorySection({ group }: { group: CategoryGroup }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {group.category}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{formatInr(group.subtotal)}</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="py-1.5 pl-3 pr-3 text-left text-xs font-medium text-muted-foreground">Description</th>
              <th className="py-1.5 pr-3 text-left text-xs font-medium text-muted-foreground">Material / Brand</th>
              <th className="py-1.5 pr-3 text-right text-xs font-medium text-muted-foreground">Qty</th>
              <th className="py-1.5 pr-3 text-right text-xs font-medium text-muted-foreground">Rate</th>
              <th className="py-1.5 pr-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 bg-background px-3">
            {group.items.map((item, i) => (
              <tr key={i} className="hover:bg-muted/20">
                <td className="py-2 pl-3 pr-3 text-sm text-foreground">{item.description}</td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">
                  {[item.material, item.brand].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="py-2 pr-3 text-right text-sm tabular-nums text-foreground">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-2 pr-3 text-right text-sm tabular-nums text-foreground">
                  {formatInr(item.rateInr)}
                </td>
                <td className="py-2 pr-3 text-right text-sm font-medium tabular-nums text-foreground">
                  {formatInr(item.amountInr)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomSection({ group }: { group: RoomGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
        aria-expanded={open}
      >
        <span className="font-medium text-foreground">{group.room}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-accent">{formatInr(group.subtotal)}</span>
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {group.categories.map((cat) => (
            <CategorySection key={cat.category} group={cat} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface BidBoqViewerProps {
  items: BidBoqItem[];
  grandTotal: number;
  className?: string;
}

export function BidBoqViewer({ items, grandTotal, className }: BidBoqViewerProps) {
  const rooms = useMemo(() => groupByRoom(items), [items]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No BOQ items provided.</p>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {rooms.map((room) => (
        <RoomSection key={room.room} group={room} />
      ))}

      {/* Grand total */}
      <div className="flex items-center justify-between rounded-xl border border-accent/20 bg-accent/5 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <IndianRupee className="h-4 w-4 text-accent" aria-hidden="true" />
          Grand Total
        </div>
        <span className="font-serif text-xl font-bold text-accent">{formatInr(grandTotal)}</span>
      </div>
    </div>
  );
}
