'use client';

/**
 * Vendor Settings — profile editor with service area management.
 *
 * Vendors can update:
 * - Bio / about
 * - Service areas (cities where they work) — controls which projects they see
 * - Work categories / specialisations
 * - Website URL
 */

import { useEffect, useState } from 'react';
import { MapPin, Briefcase, Globe, Save, Loader2, Plus, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVendorProfile, useUpdateVendorProfile } from '@/lib/api/users';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INDIAN_CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Chandigarh',
  'Kochi', 'Indore', 'Bhopal', 'Nagpur', 'Visakhapatnam', 'Coimbatore',
  'Vadodara', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad',
] as const;

const WORK_CATEGORIES = [
  'Residential Interior', 'Commercial Interior', 'Office Design',
  'Modular Kitchen', 'Modular Wardrobes', 'False Ceiling',
  'Flooring', 'Lighting Design', 'Furniture', 'Landscaping',
  'Renovation', 'Turnkey Projects',
] as const;

// ---------------------------------------------------------------------------
// Tag chip
// ---------------------------------------------------------------------------

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="ml-0.5 rounded-full hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        <h2 className="font-serif font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VendorSettingsPage() {
  const { data: profile, isLoading } = useVendorProfile();
  const updateProfile = useUpdateVendorProfile();

  const [bio, setBio] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [saved, setSaved] = useState(false);

  // Seed form from fetched profile
  useEffect(() => {
    if (!profile) return;
    const p = profile as {
      bio?: string;
      serviceAreas?: string[];
      categories?: string[];
      websiteUrl?: string;
    };
    setBio(p.bio ?? '');
    setServiceAreas(p.serviceAreas ?? []);
    setCategories(p.categories ?? []);
    setWebsiteUrl(p.websiteUrl ?? '');
  }, [profile]);

  const toggleCity = (city: string) => {
    setServiceAreas((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
    setSaved(false);
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    setSaved(false);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({ bio, serviceAreas, categories, websiteUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your profile updated — service areas control which projects you see.
        </p>
      </div>

      {/* ── Service Areas ─────────────────────────────────────────────── */}
      <Section title="Service Areas" icon={MapPin}>
        <p className="text-xs text-muted-foreground">
          Select every city where you offer interior design services.
          You will <strong>only see bidding projects from these cities</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          {INDIAN_CITIES.map((city) => {
            const active = serviceAreas.includes(city);
            return (
              <button
                key={city}
                type="button"
                onClick={() => toggleCity(city)}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                  active
                    ? 'border-transparent text-[hsl(0_0%_4%)]'
                    : 'border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground',
                )}
                style={active ? { background: 'var(--gold-gradient)' } : undefined}
              >
                {active && <span className="mr-1">✓</span>}
                {city}
              </button>
            );
          })}
        </div>
        {serviceAreas.length === 0 && (
          <p className="text-xs text-destructive">
            ⚠ No service areas selected — you won't see any projects until you select at least one city.
          </p>
        )}
        {serviceAreas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {serviceAreas.map((c) => (
              <TagChip key={c} label={c} onRemove={() => toggleCity(c)} />
            ))}
          </div>
        )}
      </Section>

      {/* ── Work Categories ───────────────────────────────────────────── */}
      <Section title="Specialisations" icon={Briefcase}>
        <p className="text-xs text-muted-foreground">
          Select the types of work you specialise in. This is shown to customers on your profile.
        </p>
        <div className="flex flex-wrap gap-2">
          {WORK_CATEGORIES.map((cat) => {
            const active = categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                  active
                    ? 'border-transparent text-[hsl(0_0%_4%)]'
                    : 'border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground',
                )}
                style={active ? { background: 'var(--gold-gradient)' } : undefined}
              >
                {active && <span className="mr-1">✓</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Bio ───────────────────────────────────────────────────────── */}
      <Section title="About Your Studio" icon={Briefcase}>
        <label htmlFor="bio" className="block text-xs font-medium text-muted-foreground">
          Bio / About (shown to customers anonymously during bidding)
        </label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => { setBio(e.target.value); setSaved(false); }}
          placeholder="Describe your studio, design philosophy, and what makes your work unique…"
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          maxLength={1000}
        />
        <p className="text-right text-xs text-muted-foreground">{bio.length}/1000</p>
      </Section>

      {/* ── Website ───────────────────────────────────────────────────── */}
      <Section title="Website" icon={Globe}>
        <label htmlFor="website" className="block text-xs font-medium text-muted-foreground">
          Website URL (revealed only after customer selects you)
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="website"
            type="url"
            value={websiteUrl}
            onChange={(e) => { setWebsiteUrl(e.target.value); setSaved(false); }}
            placeholder="https://yourstudio.com"
            className="pl-9"
          />
        </div>
      </Section>

      {/* ── Save ──────────────────────────────────────────────────────── */}
      {updateProfile.isError && (
        <p role="alert" className="text-sm text-destructive">
          {(updateProfile.error as { message?: string })?.message ?? 'Failed to save. Please try again.'}
        </p>
      )}

      <Button
        onClick={handleSave}
        disabled={updateProfile.isPending}
        className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {updateProfile.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Saved!</>
        ) : (
          <><Save className="h-4 w-4" aria-hidden="true" /> Save Changes</>
        )}
      </Button>
    </div>
  );
}
