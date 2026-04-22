'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  Home,
  Layers,
  MapPin,
  Menu,
  Moon,
  Sofa,
  Sparkles,
  Sun,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import Image from 'next/image';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useTheme } from '@/lib/hooks/useTheme';
import { cn } from '@/lib/utils';

// ─── Nav data ────────────────────────────────────────────────────────────────

const CITIES = [
  { label: 'Bengaluru', projects: '840+', href: '/vendors?city=bengaluru' },
  { label: 'Mumbai', projects: '620+', href: '/vendors?city=mumbai' },
  { label: 'Delhi NCR', projects: '510+', href: '/vendors?city=delhi' },
  { label: 'Hyderabad', projects: '290+', href: '/vendors?city=hyderabad' },
  { label: 'Pune', projects: '180+', href: '/vendors?city=pune' },
  { label: 'Chennai', projects: '140+', href: '/vendors?city=chennai' },
];

const SPACES = [
  { label: 'Modular Kitchen', icon: UtensilsCrossed, desc: 'Complete kitchen transformation', href: '/spaces/modular-kitchen', color: 'hsl(217 65% 60%)' },
  { label: 'Living Room', icon: Sofa, desc: 'Premium living spaces', href: '/spaces/living-room', color: 'hsl(142 71% 45%)' },
  { label: 'Bedroom', icon: Home, desc: 'Serene bedroom designs', href: '/spaces/bedroom', color: 'hsl(280 60% 65%)' },
  { label: 'Full Home', icon: Layers, desc: 'End-to-end home interiors', href: '/spaces/full-home', color: 'hsl(40 45% 55%)' },
  { label: 'Office', icon: Building2, desc: 'Corporate & home office', href: '/spaces/office', color: 'hsl(0 72% 60%)' },
];

const NAV_LINKS = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Explore', href: '/explore' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Pricing', href: '/pricing' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Cities mega-menu ─────────────────────────────────────────────────────────

function CitiesMenu() {
  return (
    <div className="w-[520px] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/60">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-1">
            Active Cities
          </p>
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Find Vendors Near You
          </h3>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/20">
          <MapPin className="h-4 w-4 text-accent" />
        </div>
      </div>

      {/* City grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {CITIES.map((city) => (
          <NavigationMenuLink asChild key={city.label}>
            <Link
              href={city.href}
              className="group flex flex-col gap-1 rounded-xl p-3 border border-border/50 bg-card/60 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
                  {city.label}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <span className="text-[11px] font-medium text-accent/70">{city.projects} projects</span>
            </Link>
          </NavigationMenuLink>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/15">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">More cities coming soon</p>
            <p className="text-[11px] text-muted-foreground">Join the waitlist for your city</p>
          </div>
        </div>
        <NavigationMenuLink asChild>
          <Link
            href="/contact"
            className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
          >
            Notify me <ArrowRight className="h-3 w-3" />
          </Link>
        </NavigationMenuLink>
      </div>
    </div>
  );
}

// ─── Spaces mega-menu ─────────────────────────────────────────────────────────

function SpacesMenu() {
  return (
    <div className="w-[560px] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/60">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-1">
            Space Types
          </p>
          <h3 className="font-serif text-xl font-semibold text-foreground">
            What Are You Designing?
          </h3>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/20">
          <Layers className="h-4 w-4 text-accent" />
        </div>
      </div>

      {/* Space list */}
      <div className="space-y-1.5 mb-5">
        {SPACES.map((space) => (
          <NavigationMenuLink asChild key={space.label}>
            <Link
              href={space.href}
              className="group flex items-center gap-4 rounded-xl p-3 border border-transparent hover:border-border/60 hover:bg-card/80 transition-all duration-200"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${space.color}15`, border: `1px solid ${space.color}25` }}
              >
                <space.icon className="h-4.5 w-4.5" style={{ color: space.color, width: 18, height: 18 }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
                  {space.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{space.desc}</div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
            </Link>
          </NavigationMenuLink>
        ))}
      </div>

      {/* Featured card */}
      <div
        className="relative overflow-hidden rounded-xl p-4 border border-accent/20"
        style={{
          background: 'linear-gradient(135deg, hsl(38 40% 42% / 0.12), hsl(45 55% 68% / 0.08))',
        }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
          style={{ background: 'var(--gold-gradient)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                AI-Powered
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">Get 3 free AI designs</p>
            <p className="text-xs text-muted-foreground mt-0.5">For any space, any budget</p>
          </div>
          <NavigationMenuLink asChild>
            <Link
              href="/register/customer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200 hover:scale-[1.03]"
              style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
            >
              Try Free <Sparkles className="h-3 w-3" />
            </Link>
          </NavigationMenuLink>
        </div>
      </div>
    </div>
  );
}

// ─── Main navbar ──────────────────────────────────────────────────────────────

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const solid = scrolled || !isHome;

  // Tone for plain nav links (not dropdown triggers)
  const linkTone = solid
    ? 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
    : 'text-white/70 hover:text-white hover:bg-white/10';

  // Tone for NavigationMenuTrigger
  const triggerTone = solid
    ? 'text-foreground/70 hover:text-foreground hover:bg-foreground/5 data-[state=open]:bg-foreground/5 data-[state=open]:text-foreground'
    : 'text-white/70 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white';

  // Dropdown panel background
  const panelBg = 'bg-background/98 backdrop-blur-2xl';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        solid
          ? 'backdrop-blur-xl bg-background/85 shadow-[0_1px_0_0_hsl(var(--border))] border-b border-border/50'
          : 'bg-transparent',
      )}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/Decoqo_logo.png"
              alt="Decoqo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span
            className={cn(
              'font-serif text-lg font-semibold tracking-tight transition-colors duration-300',
              solid ? 'text-foreground' : 'text-white',
            )}
          >
            Decoqo
          </span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-0.5">

              {/* Cities dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    'h-9 rounded-xl px-3.5 text-sm font-medium bg-transparent transition-all duration-200',
                    triggerTone,
                  )}
                >
                  Cities
                </NavigationMenuTrigger>
                <NavigationMenuContent className={panelBg}>
                  <CitiesMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Spaces dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    'h-9 rounded-xl px-3.5 text-sm font-medium bg-transparent transition-all duration-200',
                    triggerTone,
                  )}
                >
                  Spaces
                </NavigationMenuTrigger>
                <NavigationMenuContent className={panelBg}>
                  <SpacesMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Plain links */}
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NavigationMenuItem key={link.label}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          'relative inline-flex h-9 items-center rounded-xl px-3.5 text-sm font-medium transition-all duration-200',
                          isActive ? 'text-accent' : linkTone,
                        )}
                      >
                        {link.label}
                        {isActive && (
                          <span
                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-accent"
                            style={{ boxShadow: '0 0 8px hsl(var(--accent))' }}
                          />
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* ── Desktop actions ───────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200',
              solid
                ? 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground'
                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white',
            )}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Sign in */}
          <Link
            href="/login"
            className={cn(
              'h-9 inline-flex items-center rounded-xl px-4 text-sm font-medium transition-all duration-200',
              solid
                ? 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                : 'text-white/70 hover:text-white hover:bg-white/10',
            )}
          >
            Sign in
          </Link>

          {/* Get Started CTA */}
          <Link
            href="/register/customer"
            className="h-9 inline-flex items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
            style={{
              background: 'var(--gold-gradient)',
              color: 'hsl(0 0% 4%)',
              boxShadow: '0 2px 16px hsl(45 65% 52% / 0.3)',
            }}
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* ── Mobile actions ────────────────────────────────────────────── */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200',
              solid
                ? 'bg-foreground/5 text-foreground/70'
                : 'bg-white/10 text-white/70',
            )}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200',
              solid
                ? 'bg-foreground/5 text-foreground'
                : 'bg-white/10 text-white',
            )}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="border-t border-border/50 bg-background/98 backdrop-blur-2xl">
          <div className="overflow-y-auto max-h-[75vh] px-5 py-5 space-y-6">

            {/* Cities */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3">
                Cities
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((city) => (
                  <Link
                    key={city.label}
                    href={city.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-3.5 py-2.5 hover:border-accent/30 transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-foreground">{city.label}</span>
                    <span className="text-[11px] text-accent/70 font-medium">{city.projects}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Spaces */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3">
                Spaces
              </p>
              <div className="space-y-1.5">
                {SPACES.map((space) => (
                  <Link
                    key={space.label}
                    href={space.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 px-3.5 py-2.5 hover:border-accent/30 transition-all duration-200"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${space.color}15` }}
                    >
                      <space.icon style={{ color: space.color, width: 14, height: 14 }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{space.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="border-t border-border/40 pt-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground/75 hover:text-foreground hover:bg-foreground/5',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile CTAs */}
            <div className="border-t border-border/40 pt-4 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-xl border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground/80 hover:border-accent/30 hover:text-foreground transition-all duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/register/customer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200"
                style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
