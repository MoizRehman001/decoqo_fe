'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Search,
  FileText,
  Shield,
  Wallet,
  AlertTriangle,
  Users,
  UserCog,
  ScrollText,
  LogOut,
  Menu,
  X,
  Gem,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarVariant = 'customer' | 'vendor' | 'admin';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  variant: SidebarVariant;
  /** Optional logout handler — defaults to navigating to /login */
  onLogout?: () => void;
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: Record<SidebarVariant, NavItem[]> = {
  customer: [
    { label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', href: '/customer/projects', icon: FolderOpen },
    { label: 'Settings', href: '/customer/settings', icon: Settings },
  ],
  vendor: [
    { label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Browse Projects', href: '/vendor/projects', icon: Search },
    { label: 'My Bids', href: '/vendor/bids', icon: FileText },
    { label: 'KYC & Profile', href: '/vendor/kyc', icon: Shield },
    { label: 'Settings', href: '/vendor/settings', icon: Settings },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Escrow Monitor', href: '/admin/escrow', icon: Wallet },
    { label: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    { label: 'Vendors', href: '/admin/vendors', icon: Users },
    { label: 'User Management', href: '/admin/users', icon: UserCog },
    { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
  ],
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

function DecoqoLogo() {
  return (
    <div className="flex items-center gap-2 px-4 py-5 select-none" aria-label="Decoqo">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          'bg-primary/10',
        )}
        aria-hidden="true"
      >
        <Gem className="h-4 w-4 text-primary" />
      </div>
      <span className="text-xl font-semibold tracking-tight text-primary">
        Decoqo
      </span>
    </div>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

function SidebarNavItem({ item, isActive, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon
        className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-current')}
        aria-hidden="true"
      />
      <span>{item.label}</span>
    </Link>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

interface SidebarContentProps {
  variant: SidebarVariant;
  onLogout: () => void;
  onNavClick?: () => void;
}

function SidebarContent({ variant, onLogout, onNavClick }: SidebarContentProps) {
  const pathname = usePathname();
  const navItems = NAV_ITEMS[variant];

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <DecoqoLogo />

      {/* Divider */}
      <div className="mx-4 border-t border-border" aria-hidden="true" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <SidebarNavItem
                  item={item}
                  isActive={isActive}
                  onClick={onNavClick}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-border" aria-hidden="true" />

      {/* Logout */}
      <div className="px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
            'text-muted-foreground transition-all duration-150',
            'hover:bg-destructive/10 hover:text-destructive',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ variant, onLogout }: SidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    setMobileOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col',
          'fixed inset-y-0 left-0 z-30',
          'w-60 shrink-0',
          'bg-background border-r border-border',
        )}
        aria-label="Sidebar navigation"
      >
        <SidebarContent variant={variant} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile: Hamburger trigger ────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
        className={cn(
          'lg:hidden',
          'fixed top-4 left-4 z-40',
          'flex h-9 w-9 items-center justify-center rounded-lg',
          'bg-background border border-border shadow-sm',
          'text-foreground transition-colors',
          'hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* ── Mobile: Backdrop ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: Drawer ───────────────────────────────────────────────── */}
      <aside
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'lg:hidden',
          'fixed inset-y-0 left-0 z-50',
          'w-72',
          'bg-background border-r border-border shadow-lg',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
          className={cn(
            'absolute top-4 right-4 z-10',
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-muted-foreground',
            'hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'transition-colors',
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <SidebarContent
          variant={variant}
          onLogout={handleLogout}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}
