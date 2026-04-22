/**
 * Re-exports `useTheme` from the ThemeProvider context.
 *
 * Usage:
 *   import { useTheme } from '@/lib/hooks/useTheme';
 *   const { theme, resolvedTheme, setTheme } = useTheme();
 */
export { useTheme } from '@/components/layout/ThemeProvider';
export type { Theme, ResolvedTheme } from '@/components/layout/ThemeProvider';
