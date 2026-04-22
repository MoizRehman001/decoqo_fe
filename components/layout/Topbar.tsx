'use client';

import { LogOut, Settings, User } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopbarUser {
  name: string;
  email: string;
  role: string;
}

interface TopbarProps {
  user?: TopbarUser;
  onLogout?: () => void;
  title?: string;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full',
        'bg-primary text-primary-foreground',
        'text-sm font-semibold select-none shrink-0',
      )}
    >
      {initial}
    </span>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar({ user, onLogout, title }: TopbarProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20',
        'left-0 lg:left-60',
        'h-16 flex items-center',
        'bg-background border-b border-border',
        'px-4 lg:px-6',
      )}
      aria-label="Top navigation bar"
    >
      {/* Left: title */}
      <div className="flex-1 min-w-0 pl-10 lg:pl-0">
        {title ? (
          <h1 className="text-base font-semibold text-foreground truncate">
            {title}
          </h1>
        ) : (
          <div className="h-4 w-32 rounded bg-muted animate-pulse" aria-hidden="true" />
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Open user menu for ${user.name}`}
                className={cn(
                  'flex items-center gap-2 rounded-full ml-1 p-0.5',
                  'transition-all duration-150',
                  'hover:ring-2 hover:ring-primary/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                )}
              >
                <UserAvatar name={user.name} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  <span className="mt-0.5 text-xs font-medium text-primary capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onSelect={() => {
                  const rolePrefix = user.role.toLowerCase();
                  window.location.href = `/${rolePrefix}/settings`;
                }}
              >
                <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>Profile &amp; Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={handleLogout}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ml-1"
            aria-hidden="true"
          >
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
    </header>
  );
}
