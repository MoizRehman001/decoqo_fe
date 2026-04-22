/**
 * Money utilities for INR / paise arithmetic.
 *
 * SHARED-06: All money displayed in INR format (₹12,00,000)
 *
 * All monetary values in the backend are stored as paise (integer).
 * 1 INR = 100 paise
 */

/**
 * Format a paise amount as a human-readable INR string.
 * e.g. 120000000 paise → "₹12,00,000"
 */
export const formatInr = (paise: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);

/**
 * Format a paise amount as INR with decimal places.
 * e.g. 12050 paise → "₹120.50"
 */
export const formatInrWithDecimals = (paise: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);

/**
 * Convert paise to INR (float).
 * e.g. 12050 → 120.50
 */
export const paiseToInr = (paise: number): number => paise / 100;

/**
 * Convert INR to paise (integer, rounded).
 * e.g. 120.50 → 12050
 */
export const inrToPaise = (inr: number): number => Math.round(inr * 100);

/**
 * Format a paise amount as a compact INR string for display in cards/badges.
 * e.g. 10000000 paise → "₹1L", 100000000 paise → "₹1Cr"
 */
export const formatInrCompact = (paise: number): string => {
  const inr = paise / 100;
  if (inr >= 10_000_000) {
    return `₹${(inr / 10_000_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  }
  if (inr >= 100_000) {
    return `₹${(inr / 100_000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (inr >= 1_000) {
    return `₹${(inr / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return formatInr(paise);
};

/**
 * Add two paise amounts safely (integer arithmetic).
 */
export const addPaise = (a: number, b: number): number => a + b;

/**
 * Calculate percentage of a paise amount.
 * e.g. 10% of 100000 paise = 10000 paise
 */
export const percentOfPaise = (paise: number, percent: number): number =>
  Math.round((paise * percent) / 100);
