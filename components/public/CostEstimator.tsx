'use client';

/**
 * CostEstimator — interactive project cost calculator tool.
 * 0.24: Build "Calculate your project cost" estimator tool
 * Guest experience — no login required.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator, Home, Building2, Briefcase,
  ArrowRight, Sparkles, IndianRupee, Info,
} from 'lucide-react';
import { formatInr, formatInrCompact } from '@/lib/utils/money';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Pricing data (per sqft in paise)
// ---------------------------------------------------------------------------

const CITY_MULTIPLIERS: Record<string, number> = {
  'Bengaluru': 1.0,
  'Mumbai': 1.15,
  'Delhi NCR': 1.1,
  'Hyderabad': 0.9,
  'Pune': 0.95,
  'Chennai': 0.92,
  'Other': 0.85,
};

const QUALITY_RATES: Record<string, { label: string; ratePerSqft: number; desc: string; color: string }> = {
  ECONOMY: {
    label: 'Economy',
    ratePerSqft: 80000, // ₹800/sqft in paise
    desc: 'Local brands, basic finishes, functional design',
    color: 'hsl(0 0% 50%)',
  },
  STANDARD: {
    label: 'Standard',
    ratePerSqft: 150000, // ₹1,500/sqft
    desc: 'Mid-range brands, good quality, popular styles',
    color: 'hsl(217 65% 60%)',
  },
  PREMIUM: {
    label: 'Premium',
    ratePerSqft: 250000, // ₹2,500/sqft
    desc: 'Premium brands, superior finishes, custom designs',
    color: 'hsl(40 45% 55%)',
  },
  LUXURY: {
    label: 'Luxury',
    ratePerSqft: 450000, // ₹4,500/sqft
    desc: 'Imported materials, bespoke designs, white-glove service',
    color: 'hsl(280 60% 65%)',
  },
};

const SPACE_TYPES = [
  { value: 'RESIDENTIAL', label: 'Residential', icon: Home },
  { value: 'OFFICE', label: 'Office', icon: Briefcase },
  { value: 'COMMERCIAL', label: 'Commercial', icon: Building2 },
];

const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Other'];

const SCOPE_ITEMS = [
  { key: 'falseCeiling', label: 'False Ceiling', multiplier: 0.15 },
  { key: 'flooring', label: 'Flooring', multiplier: 0.2 },
  { key: 'painting', label: 'Painting', multiplier: 0.08 },
  { key: 'electrical', label: 'Electrical', multiplier: 0.12 },
  { key: 'furniture', label: 'Furniture', multiplier: 0.3 },
  { key: 'kitchen', label: 'Modular Kitchen', multiplier: 0.25 },
  { key: 'wardrobes', label: 'Wardrobes', multiplier: 0.2 },
  { key: 'bathrooms', label: 'Bathrooms', multiplier: 0.15 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CostEstimator() {
  const [spaceType, setSpaceType] = useState('RESIDENTIAL');
  const [city, setCity] = useState('Bengaluru');
  const [areaSqft, setAreaSqft] = useState('1000');
  const [quality, setQuality] = useState('STANDARD');
  const [scope, setScope] = useState<Record<string, boolean>>({
    falseCeiling: true,
    flooring: true,
    painting: true,
    electrical: true,
    furniture: true,
    kitchen: false,
    wardrobes: false,
    bathrooms: false,
  });

  const estimate = useMemo(() => {
    const area = parseFloat(areaSqft) || 0;
    if (area <= 0) return null;

    const qualityData = QUALITY_RATES[quality]!;
    const cityMultiplier = CITY_MULTIPLIERS[city] ?? 1.0;
    const baseRate = qualityData.ratePerSqft * cityMultiplier;

    // Calculate scope-based estimate
    const selectedScope = SCOPE_ITEMS.filter((s) => scope[s.key]);
    const scopeMultiplier = selectedScope.reduce((sum, s) => sum + s.multiplier, 0);
    const normalizedMultiplier = Math.max(0.3, Math.min(scopeMultiplier, 1.2));

    const basePaise = Math.round(area * baseRate * normalizedMultiplier);
    const minPaise = Math.round(basePaise * 0.85);
    const maxPaise = Math.round(basePaise * 1.2);

    return { minPaise, maxPaise, basePaise };
  }, [areaSqft, quality, city, scope]);

  const toggleScope = (key: string) => {
    setScope((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <Calculator className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">
              Free Tool
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Project Cost{' '}
            <span className="gold-text italic">Estimator</span>
          </h1>
          <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto">
            Get a realistic budget estimate for your interior project in seconds. No login required.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Space type */}
            <div className="ivory-card rounded-2xl p-6">
              <h3 className="font-serif font-semibold text-foreground mb-4">Space Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {SPACE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSpaceType(s.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                      spaceType === s.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:border-accent/40 hover:bg-accent/5',
                    )}
                  >
                    <s.icon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* City + Area */}
            <div className="ivory-card rounded-2xl p-6">
              <h3 className="font-serif font-semibold text-foreground mb-4">Location & Size</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Carpet Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    placeholder="e.g. 1000"
                  />
                </div>
              </div>
            </div>

            {/* Quality level */}
            <div className="ivory-card rounded-2xl p-6">
              <h3 className="font-serif font-semibold text-foreground mb-4">Quality Level</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(QUALITY_RATES).map(([key, q]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setQuality(key)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-all',
                      quality === key
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/30',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">{q.label}</span>
                      <span className="text-xs font-bold" style={{ color: q.color }}>
                        ₹{Math.round(q.ratePerSqft / 100)}/sqft
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div className="ivory-card rounded-2xl p-6">
              <h3 className="font-serif font-semibold text-foreground mb-1">Scope of Work</h3>
              <p className="text-xs text-muted-foreground mb-4">Select what you want included</p>
              <div className="grid grid-cols-2 gap-2">
                {SCOPE_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleScope(item.key)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all text-left',
                      scope[item.key]
                        ? 'border-accent bg-accent/10 text-accent font-medium'
                        : 'border-border text-muted-foreground hover:border-accent/30',
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-all',
                        scope[item.key] ? 'border-accent bg-accent' : 'border-muted-foreground/40',
                      )}
                    >
                      {scope[item.key] && (
                        <svg className="h-2.5 w-2.5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result card — sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(38 40% 42% / 0.12), hsl(45 55% 68% / 0.08))',
                border: '1px solid hsl(45 65% 52% / 0.25)',
              }}
            >
              <div
                className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ background: 'var(--gold-gradient)' }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <IndianRupee className="h-5 w-5 text-accent" />
                  <h3 className="font-serif font-semibold text-foreground">Estimated Budget</h3>
                </div>

                {estimate ? (
                  <>
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground font-sans mb-1">Estimated Range</p>
                      <p className="font-serif text-3xl font-bold gold-text">
                        {formatInrCompact(estimate.minPaise)} – {formatInrCompact(estimate.maxPaise)}
                      </p>
                      <p className="text-xs text-muted-foreground font-sans mt-1">
                        Based on {areaSqft} sq.ft in {city}
                      </p>
                    </div>

                    <div className="space-y-2 my-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="font-medium text-foreground">{QUALITY_RATES[quality]?.label}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">City factor</span>
                        <span className="font-medium text-foreground">{CITY_MULTIPLIERS[city]}×</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Scope items</span>
                        <span className="font-medium text-foreground">
                          {Object.values(scope).filter(Boolean).length} selected
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-xl bg-muted/30 p-3 mb-4">
                      <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground font-sans">
                        This is an indicative estimate. Actual quotes from vendors may vary based on specific requirements and site conditions.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Calculator className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Enter your project details to see an estimate</p>
                  </div>
                )}

                <Link
                  href="/register/customer"
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] w-full"
                  style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
                >
                  <Sparkles className="h-4 w-4" />
                  Get Real Quotes from Vendors
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-center text-xs text-muted-foreground font-sans mt-2">
                  Free · No commitment · Anonymous bids
                </p>
              </div>
            </div>

            {/* Trust signals */}
            <div className="ivory-card rounded-xl p-4 space-y-2">
              {[
                '✓ Anonymous bids from verified vendors',
                '✓ Escrow-backed payments',
                '✓ BOQ locked — no surprises',
                '✓ Dispute resolution in 48h',
              ].map((t) => (
                <p key={t} className="text-xs text-muted-foreground font-sans">{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
