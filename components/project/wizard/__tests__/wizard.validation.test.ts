/**
 * Unit tests for wizard step validation schemas.
 * Tests Zod schemas used in each wizard step.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Step 2 — Location schema (mirrors Step2Location.tsx)
// ---------------------------------------------------------------------------

const locationSchema = z.object({
  title: z
    .string()
    .min(5, 'Project title must be at least 5 characters')
    .max(120, 'Project title must be at most 120 characters')
    .trim(),
  city: z.string().min(1, 'Please select a city'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian pincode'),
});

// ---------------------------------------------------------------------------
// Step 3 — Room schema
// ---------------------------------------------------------------------------

const roomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Room name is required'),
  lengthFt: z.number().positive('Length must be positive'),
  widthFt: z.number().positive('Width must be positive'),
  heightFt: z.number().positive('Height must be positive'),
});

const roomsSchema = z.array(roomSchema).min(1, 'At least one room is required');

// ---------------------------------------------------------------------------
// Step 5 — Path schema
// ---------------------------------------------------------------------------

const pathSchema = z.discriminatedUnion('path', [
  z.object({
    path: z.literal('AI_DESIGN'),
    aiTheme: z.string().optional(),
  }),
  z.object({
    path: z.literal('BIDDING'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
  }),
]);

// ---------------------------------------------------------------------------
// Step 6 — Budget schema
// ---------------------------------------------------------------------------

const budgetSchema = z
  .object({
    budgetMin: z.number().positive('Minimum budget must be positive'),
    budgetMax: z.number().positive('Maximum budget must be positive'),
    budgetFlexibility: z.enum(['STRICT', 'FLEXIBLE', 'VERY_FLEXIBLE']),
    timeline: z.enum(['4_WEEKS', '6_WEEKS', '8_WEEKS', '12_WEEKS', 'FLEXIBLE']),
    priority: z.enum(['QUALITY_FIRST', 'SPEED_FIRST', 'BUDGET_FIRST']),
  })
  .refine((d) => d.budgetMax > d.budgetMin, {
    message: 'Maximum budget must be greater than minimum budget',
    path: ['budgetMax'],
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Step 2 — Location Validation', () => {
  it('accepts valid location data', () => {
    const result = locationSchema.safeParse({
      title: 'My 3BHK Renovation Project',
      city: 'Bengaluru',
      pincode: '560034',
    });
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 5 characters', () => {
    const result = locationSchema.safeParse({
      title: 'Hi',
      city: 'Bengaluru',
      pincode: '560034',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('at least 5 characters');
    }
  });

  it('rejects title longer than 120 characters', () => {
    const result = locationSchema.safeParse({
      title: 'A'.repeat(121),
      city: 'Bengaluru',
      pincode: '560034',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty city', () => {
    const result = locationSchema.safeParse({
      title: 'Valid Project Title',
      city: '',
      pincode: '560034',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('select a city');
    }
  });

  it('rejects pincode with fewer than 6 digits', () => {
    const result = locationSchema.safeParse({
      title: 'Valid Project Title',
      city: 'Mumbai',
      pincode: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects pincode with more than 6 digits', () => {
    const result = locationSchema.safeParse({
      title: 'Valid Project Title',
      city: 'Mumbai',
      pincode: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric pincode', () => {
    const result = locationSchema.safeParse({
      title: 'Valid Project Title',
      city: 'Mumbai',
      pincode: 'ABCDEF',
    });
    expect(result.success).toBe(false);
  });

  it('trims whitespace from title', () => {
    const result = locationSchema.safeParse({
      title: '  My Project Title  ',
      city: 'Pune',
      pincode: '411001',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My Project Title');
    }
  });
});

describe('Step 3 — Rooms Validation', () => {
  const validRoom = {
    id: 'room_001',
    name: 'Living Room',
    lengthFt: 18,
    widthFt: 14,
    heightFt: 10,
  };

  it('accepts a valid room', () => {
    const result = roomSchema.safeParse(validRoom);
    expect(result.success).toBe(true);
  });

  it('rejects room with zero length', () => {
    const result = roomSchema.safeParse({ ...validRoom, lengthFt: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects room with negative width', () => {
    const result = roomSchema.safeParse({ ...validRoom, widthFt: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects empty room name', () => {
    const result = roomSchema.safeParse({ ...validRoom, name: '' });
    expect(result.success).toBe(false);
  });

  it('requires at least one room in the array', () => {
    const result = roomsSchema.safeParse([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('At least one room');
    }
  });

  it('accepts multiple valid rooms', () => {
    const result = roomsSchema.safeParse([
      validRoom,
      { id: 'room_002', name: 'Bedroom', lengthFt: 14, widthFt: 12, heightFt: 10 },
    ]);
    expect(result.success).toBe(true);
  });
});

describe('Step 5 — Path Choice Validation', () => {
  it('accepts AI_DESIGN path without description', () => {
    const result = pathSchema.safeParse({ path: 'AI_DESIGN', aiTheme: 'Modern minimalist' });
    expect(result.success).toBe(true);
  });

  it('accepts AI_DESIGN path without theme', () => {
    const result = pathSchema.safeParse({ path: 'AI_DESIGN' });
    expect(result.success).toBe(true);
  });

  it('accepts BIDDING path with sufficient description', () => {
    const result = pathSchema.safeParse({
      path: 'BIDDING',
      description: 'This is a detailed description of my interior design project with all the requirements and preferences I have for the space.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects BIDDING path with short description', () => {
    const result = pathSchema.safeParse({
      path: 'BIDDING',
      description: 'Too short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('at least 50 characters');
    }
  });

  it('rejects BIDDING path with empty description', () => {
    const result = pathSchema.safeParse({
      path: 'BIDDING',
      description: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('Step 6 — Budget Validation', () => {
  const validBudget = {
    budgetMin: 500000,
    budgetMax: 2000000,
    budgetFlexibility: 'FLEXIBLE' as const,
    timeline: '8_WEEKS' as const,
    priority: 'QUALITY_FIRST' as const,
  };

  it('accepts valid budget data', () => {
    const result = budgetSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
  });

  it('rejects when max is less than min', () => {
    const result = budgetSchema.safeParse({
      ...validBudget,
      budgetMin: 2000000,
      budgetMax: 500000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('greater than minimum');
    }
  });

  it('rejects when max equals min', () => {
    const result = budgetSchema.safeParse({
      ...validBudget,
      budgetMin: 1000000,
      budgetMax: 1000000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero budget', () => {
    const result = budgetSchema.safeParse({ ...validBudget, budgetMin: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative budget', () => {
    const result = budgetSchema.safeParse({ ...validBudget, budgetMin: -100000 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid flexibility value', () => {
    const result = budgetSchema.safeParse({
      ...validBudget,
      budgetFlexibility: 'SOMEWHAT_FLEXIBLE',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid timeline value', () => {
    const result = budgetSchema.safeParse({
      ...validBudget,
      timeline: '3_WEEKS',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid flexibility options', () => {
    const flexibilities = ['STRICT', 'FLEXIBLE', 'VERY_FLEXIBLE'] as const;
    for (const f of flexibilities) {
      const result = budgetSchema.safeParse({ ...validBudget, budgetFlexibility: f });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid timeline options', () => {
    const timelines = ['4_WEEKS', '6_WEEKS', '8_WEEKS', '12_WEEKS', 'FLEXIBLE'] as const;
    for (const t of timelines) {
      const result = budgetSchema.safeParse({ ...validBudget, timeline: t });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid priority options', () => {
    const priorities = ['QUALITY_FIRST', 'SPEED_FIRST', 'BUDGET_FIRST'] as const;
    for (const p of priorities) {
      const result = budgetSchema.safeParse({ ...validBudget, priority: p });
      expect(result.success).toBe(true);
    }
  });
});
