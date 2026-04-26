import type { Metadata } from 'next';
import { SpaceLandingPage } from '@/components/public/SpaceLandingPage';

export const metadata: Metadata = {
  title: 'Modular Kitchen Design — Decoqo',
  description: 'Get AI-designed modular kitchens with anonymous bids from verified vendors. Escrow-backed execution across India.',
};

export default function ModularKitchenPage() {
  return (
    <SpaceLandingPage
      space={{
        name: 'Modular Kitchen',
        slug: 'modular-kitchen',
        tagline: 'From concept to completion — AI-designed kitchens with verified vendors and escrow-backed execution.',
        description: 'A modular kitchen is the heart of your home. Decoqo connects you with verified kitchen specialists who deliver premium modular kitchens with Hettich, Hafele, or Blum fittings — all within your budget and timeline.',
        heroImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85',
        avgBudgetMin: 400000,
        avgBudgetMax: 1500000,
        avgTimeline: '4–8 weeks',
        projectCount: 380,
        features: [
          'AI-generated 3D kitchen concepts in minutes',
          'Anonymous bids from 50+ verified kitchen specialists',
          'BOQ locked — no surprise material substitutions',
          'Escrow released only after your approval',
          'Premium fittings: Hettich, Hafele, Blum, Grass',
          'Modular units with 10-year warranty',
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
          'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
          'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&q=80',
          'https://images.unsplash.com/photo-1556909045-f3c1b5a28b8e?w=400&q=80',
        ],
        faqs: [
          { q: 'How long does a modular kitchen take?', a: 'Typically 4–8 weeks from design approval to installation. This includes fabrication time (3–4 weeks) and installation (3–5 days).' },
          { q: 'What brands of fittings are available?', a: 'We work with vendors who use Hettich, Hafele, Blum, and Grass fittings. The specific brand is locked in the BOQ before work begins.' },
          { q: 'Can I customise the layout?', a: 'Yes. Our AI design tool generates concepts based on your floor plan and preferences. You can request modifications before locking the design.' },
          { q: 'What is included in the BOQ?', a: 'The BOQ includes all cabinets, shutters, hardware, countertop, sink, chimney installation, and labour. Nothing is left ambiguous.' },
        ],
      }}
    />
  );
}
