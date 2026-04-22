'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render the real icon after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'inline-flex items-center justify-center',
        'h-9 w-9 rounded-full',
        'text-foreground/70',
        'transition-all duration-200',
        'hover:bg-gold/10 hover:text-gold',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
        'active:scale-95',
        className,
      )}
    >
      {/* Render a fixed-size placeholder before mount to prevent layout shift */}
      {!mounted ? (
        <span className="h-4 w-4" aria-hidden="true" />
      ) : isDark ? (
        <Sun
          className="h-4 w-4 transition-transform duration-300"
          aria-hidden="true"
        />
      ) : (
        <Moon
          className="h-4 w-4 transition-transform duration-300"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
