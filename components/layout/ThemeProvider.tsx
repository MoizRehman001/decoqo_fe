'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** The stored preference: 'light' | 'dark' | 'system' */
  theme: Theme;
  /** The actual applied theme after resolving 'system' */
  resolvedTheme: ResolvedTheme;
  /** Update the theme preference */
  setTheme: (theme: Theme) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'decoqo-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>('light');

  // On mount: read persisted preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme =
      stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : defaultTheme;

    const resolved = resolveTheme(initial);
    setThemeState(initial);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [defaultTheme]);

  // Listen for system preference changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const resolved: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    setThemeState(next);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

// ── Anti-flash inline script ──────────────────────────────────────────────────
//
// Inject this <script> tag as the very first child of <head> (before any CSS)
// to prevent a flash of the wrong theme on first paint.
//
// Usage in app/layout.tsx:
//   import { themeScript } from '@/components/layout/ThemeProvider';
//   ...
//   <head>
//     <script dangerouslySetInnerHTML={{ __html: themeScript }} />
//   </head>

export const themeScript = /* js */ `
(function () {
  try {
    var stored = localStorage.getItem('decoqo-theme');
    var theme = stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`.trim();
