import type { Metadata } from 'next';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { HowItWorksHero } from '@/components/public/HowItWorksHero';
import { HowItWorksFaq } from '@/components/public/HowItWorksFaq';
import { HowItWorksCta } from '@/components/public/HowItWorksCta';

export const metadata: Metadata = {
  title: 'How It Works — Decoqo',
  description:
    'Learn how Decoqo governs every interior project end-to-end — from AI design to anonymous bidding, escrow-backed milestones, and dispute resolution.',
};

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorksHero />
      <HowItWorksSection />
      <TrustSection />
      <HowItWorksFaq />
      <HowItWorksCta />
    </>
  );
}
