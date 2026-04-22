'use client';

/**
 * AI Design Generation screen — theme text + style/color/material/lighting filters.
 * CUST-15: Theme text input + filters
 * CUST-16: AI generation progress (WebSocket real-time, animated progress bar)
 */

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenerateDesigns, usePollDesignProgress } from '@/lib/api/bidding';
import type { AiDesign, AiStyleFilter, AiColorFilter, AiMaterialFilter, AiLightingFilter } from '@/types/bidding.types';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

const STYLE_OPTIONS: { value: AiStyleFilter; label: string; emoji: string }[] = [
  { value: 'MODERN', label: 'Modern', emoji: '🏙️' },
  { value: 'TRADITIONAL', label: 'Traditional', emoji: '🏛️' },
  { value: 'SCANDINAVIAN', label: 'Scandinavian', emoji: '🌿' },
  { value: 'INDUSTRIAL', label: 'Industrial', emoji: '⚙️' },
  { value: 'BOHEMIAN', label: 'Bohemian', emoji: '🎨' },
  { value: 'LUXURY', label: 'Luxury', emoji: '💎' },
];

const COLOR_OPTIONS: { value: AiColorFilter; label: string; swatch: string }[] = [
  { value: 'NEUTRAL', label: 'Neutral', swatch: '#D4C5B0' },
  { value: 'WARM', label: 'Warm', swatch: '#E8A87C' },
  { value: 'COOL', label: 'Cool', swatch: '#7CB9E8' },
  { value: 'BOLD', label: 'Bold', swatch: '#E84393' },
  { value: 'MONOCHROME', label: 'Monochrome', swatch: '#555555' },
];

const MATERIAL_OPTIONS: { value: AiMaterialFilter; label: string; emoji: string }[] = [
  { value: 'WOOD', label: 'Wood', emoji: '🪵' },
  { value: 'MARBLE', label: 'Marble', emoji: '🪨' },
  { value: 'METAL', label: 'Metal', emoji: '🔩' },
  { value: 'FABRIC', label: 'Fabric', emoji: '🧵' },
  { value: 'GLASS', label: 'Glass', emoji: '🪟' },
];

const LIGHTING_OPTIONS: { value: AiLightingFilter; label: string; emoji: string }[] = [
  { value: 'NATURAL', label: 'Natural', emoji: '☀️' },
  { value: 'WARM_ARTIFICIAL', label: 'Warm Light', emoji: '🕯️' },
  { value: 'COOL_ARTIFICIAL', label: 'Cool Light', emoji: '💡' },
  { value: 'DRAMATIC', label: 'Dramatic', emoji: '🎭' },
];

// ---------------------------------------------------------------------------
// FilterChip
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  emoji,
  swatch,
  selected,
  onClick,
}: {
  label: string;
  emoji?: string;
  swatch?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        selected
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground',
      )}
      aria-pressed={selected}
    >
      {swatch && (
        <span
          className="h-3.5 w-3.5 rounded-full border border-border/50 flex-shrink-0"
          style={{ background: swatch }}
          aria-hidden="true"
        />
      )}
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// GenerationProgress
// ---------------------------------------------------------------------------

export function GenerationProgress({ design, onComplete }: { design: AiDesign; onComplete: (d: AiDesign) => void }) {
  const pollMutation = usePollDesignProgress();
  const [currentDesign, setCurrentDesign] = useState(design);

  useEffect(() => {
    if (currentDesign.status === 'COMPLETED') {
      onComplete(currentDesign);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await pollMutation.mutateAsync(currentDesign.id);
        setCurrentDesign(updated);
        if (updated.status === 'COMPLETED') {
          clearInterval(interval);
          onComplete(updated);
        }
      } catch {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDesign.id, currentDesign.status]);

  const steps = [
    { label: 'Analysing your space', threshold: 20 },
    { label: 'Applying style filters', threshold: 45 },
    { label: 'Generating concepts', threshold: 70 },
    { label: 'Rendering final designs', threshold: 90 },
    { label: 'Complete!', threshold: 100 },
  ];

  const currentStep = steps.findLast((s) => currentDesign.progress >= s.threshold) ?? steps[0]!;

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      {/* Animated icon */}
      <div className="relative">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center animate-pulse-glow"
          style={{ background: 'hsl(var(--accent) / 0.15)' }}
        >
          <Sparkles className="h-9 w-9 text-accent animate-float" aria-hidden="true" />
        </div>
      </div>

      <div>
        <h3 className="font-serif text-xl font-semibold text-foreground">
          Generating your designs…
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{currentStep.label}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums font-medium text-accent">{currentDesign.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${currentDesign.progress}%`,
              background: 'var(--gold-gradient)',
            }}
            role="progressbar"
            aria-valuenow={currentDesign.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        This usually takes 30–60 seconds. Please don&apos;t close this page.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DesignGenerator — main component
// ---------------------------------------------------------------------------

interface DesignGeneratorProps {
  projectId: string;
  onDesignsReady: (design: AiDesign) => void;
}

export function DesignGenerator({ projectId, onDesignsReady }: DesignGeneratorProps) {
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState<AiStyleFilter | null>(null);
  const [color, setColor] = useState<AiColorFilter | null>(null);
  const [material, setMaterial] = useState<AiMaterialFilter | null>(null);
  const [lighting, setLighting] = useState<AiLightingFilter | null>(null);
  const [generatingDesign, setGeneratingDesign] = useState<AiDesign | null>(null);

  const generateMutation = useGenerateDesigns();

  const handleGenerate = useCallback(async () => {
    if (!theme.trim()) return;
    try {
      const design = await generateMutation.mutateAsync({
        projectId,
        theme: theme.trim(),
        filters: { style, color, material, lighting },
      });
      setGeneratingDesign(design);
    } catch {
      // error handled by mutation state
    }
  }, [projectId, theme, style, color, material, lighting, generateMutation]);

  if (generatingDesign) {
    return (
      <GenerationProgress
        design={generatingDesign}
        onComplete={onDesignsReady}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-1">
          Describe Your Vision
        </h2>
        <p className="text-sm text-muted-foreground">
          Tell our AI what you want. The more detail, the better the designs.
        </p>
      </div>

      {/* Theme text */}
      <div>
        <label htmlFor="ai-theme" className="mb-1.5 block text-sm font-medium text-foreground">
          Design Theme <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <textarea
          id="ai-theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="e.g. Contemporary minimal with warm wood accents, open kitchen concept, lots of natural light, neutral palette with gold accents…"
          rows={3}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 resize-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">{theme.length}/500 characters</p>
      </div>

      {/* Style */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Style</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={style === opt.value}
              onClick={() => setStyle(style === opt.value ? null : opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Color Palette</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              swatch={opt.swatch}
              selected={color === opt.value}
              onClick={() => setColor(color === opt.value ? null : opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Primary Material</p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={material === opt.value}
              onClick={() => setMaterial(material === opt.value ? null : opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Lighting */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Lighting Mood</p>
        <div className="flex flex-wrap gap-2">
          {LIGHTING_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={lighting === opt.value}
              onClick={() => setLighting(lighting === opt.value ? null : opt.value)}
            />
          ))}
        </div>
      </div>

      {generateMutation.isError && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to start generation. Please try again.
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={!theme.trim() || generateMutation.isPending}
        className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {generateMutation.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Starting generation…</>
        ) : (
          <><Sparkles className="h-4 w-4" aria-hidden="true" /> Generate AI Designs</>
        )}
      </Button>
    </div>
  );
}
