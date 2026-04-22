'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWizard } from './WizardShell';
import { cn } from '@/lib/utils';
import type { Room } from '@/types/project.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROOM_NAMES = [
  'Living Room',
  'Bedroom',
  'Master Bedroom',
  'Kitchen',
  'Bathroom',
  'Dining Room',
  'Study Room',
  'Balcony',
  'Pooja Room',
  'Other',
] as const;

function generateRoomId(): string {
  return `room_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Room Row
// ---------------------------------------------------------------------------

interface RoomRowProps {
  room: Room;
  index: number;
  onUpdate: (id: string, field: keyof Room, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function RoomRow({ room, index, onUpdate, onRemove, canRemove }: RoomRowProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Room {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(room.id)}
            aria-label={`Remove room ${index + 1}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Room Name */}
        <div className="sm:col-span-2">
          <label
            htmlFor={`room-name-${room.id}`}
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Room Type
          </label>
          <select
            id={`room-name-${room.id}`}
            value={room.name}
            onChange={(e) => onUpdate(room.id, 'name', e.target.value)}
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            )}
          >
            {ROOM_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Dimensions */}
        {(
          [
            { field: 'lengthFt', label: 'Length (ft)' },
            { field: 'widthFt', label: 'Width (ft)' },
            { field: 'heightFt', label: 'Height (ft)' },
          ] as const
        ).map(({ field, label }) => (
          <div key={field}>
            <label
              htmlFor={`room-${field}-${room.id}`}
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              {label}
            </label>
            <Input
              id={`room-${field}-${room.id}`}
              type="number"
              inputMode="decimal"
              min={1}
              max={200}
              step={0.5}
              value={room[field] || ''}
              onChange={(e) => onUpdate(room.id, field, parseFloat(e.target.value) || 0)}
              className="h-9 text-sm"
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Step3Rooms() {
  const { state, dispatch, goNext } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const rooms = state.rooms.length > 0
    ? state.rooms
    : [{ id: generateRoomId(), name: 'Living Room', lengthFt: 0, widthFt: 0, heightFt: 0 }];

  const updateRoom = useCallback(
    (id: string, field: keyof Room, value: string | number) => {
      const updated = rooms.map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      );
      dispatch({ type: 'SET_ROOMS', payload: updated });
      setError(null);
    },
    [rooms, dispatch],
  );

  const addRoom = useCallback(() => {
    const newRoom: Room = {
      id: generateRoomId(),
      name: 'Bedroom',
      lengthFt: 0,
      widthFt: 0,
      heightFt: 0,
    };
    dispatch({ type: 'SET_ROOMS', payload: [...rooms, newRoom] });
  }, [rooms, dispatch]);

  const removeRoom = useCallback(
    (id: string) => {
      dispatch({ type: 'SET_ROOMS', payload: rooms.filter((r) => r.id !== id) });
    },
    [rooms, dispatch],
  );

  const handleContinue = () => {
    if (rooms.length === 0) {
      setError('Please add at least one room.');
      return;
    }
    const invalid = rooms.some((r) => !r.lengthFt || !r.widthFt || !r.heightFt);
    if (invalid) {
      setError('Please fill in all room dimensions.');
      return;
    }
    dispatch({ type: 'SET_ROOMS', payload: rooms });
    goNext();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Tell us about your rooms
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add each room with its dimensions in feet
        </p>
      </div>

      <div className="space-y-3">
        {rooms.map((room, i) => (
          <RoomRow
            key={room.id}
            room={room}
            index={i}
            onUpdate={updateRoom}
            onRemove={removeRoom}
            canRemove={rooms.length > 1}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <button
        type="button"
        onClick={addRoom}
        className={cn(
          'mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3',
          'text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        )}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Room
      </button>

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
