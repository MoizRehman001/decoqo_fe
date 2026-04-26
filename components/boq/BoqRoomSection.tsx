'use client';

/**
 * BoqRoomSection — collapsible room group with add-item capability.
 * 6.2: Collapsible room group with room total
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoqItemRow, type BoqItemRowChanges } from '@/components/boq/BoqItemRow';
import { formatInr } from '@/lib/utils/money';
import { cn } from '@/lib/utils';
import type { BoqItem } from '@/types/boq.types';

interface BoqRoomSectionProps {
  room: string;
  items: BoqItem[];
  readOnly: boolean;
  onAddItem: (room: string) => void;
  onUpdateItem: (itemId: string, changes: BoqItemRowChanges) => void;
  onRemoveItem: (itemId: string) => void;
  removingItemId?: string | null;
}

export function BoqRoomSection({
  room,
  items,
  readOnly,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  removingItemId,
}: BoqRoomSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const roomTotal = items.reduce((sum, item) => sum + item.amountPaise, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Room header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/20"
        aria-expanded={expanded}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Home className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-foreground">{room}</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Room total */}
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {roomTotal > 0 ? formatInr(roomTotal) : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground">Room total</p>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {/* Items */}
      {expanded && (
        <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-2">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-6 text-center">
              <p className="text-sm text-muted-foreground">No items yet for this room.</p>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddItem(room)}
                  className="mt-2 gap-1.5 text-accent hover:text-accent hover:bg-accent/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add first item
                </Button>
              )}
            </div>
          ) : (
            <>
              {items.map((item) => (
                <BoqItemRow
                  key={item.id}
                  item={item}
                  readOnly={readOnly}
                  onUpdate={onUpdateItem}
                  onRemove={onRemoveItem}
                  isRemoving={removingItemId === item.id}
                />
              ))}

              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddItem(room)}
                  className={cn(
                    'mt-1 w-full gap-1.5 rounded-xl border border-dashed border-border/60',
                    'text-muted-foreground hover:text-accent hover:border-accent/40 hover:bg-accent/5',
                    'transition-all duration-150',
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item to {room}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
