import type { Metadata } from 'next';
import GrainOverlay from '@/components/layout/GrainOverlay';
import JourneyProgress from '@/components/layout/JourneyProgress';
import CursorSpotlight from '@/components/layout/CursorSpotlight';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProofBar } from '@/components/landing/SocialProofBar';
import { StoryJourneySection } from '@/components/landing/StoryJourneySection';
import { MarketplaceSection } from '@/components/landing/MarketplaceSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';

export const metadata: Metadata = {
  title: 'Decoqo — Design Any Space. Bid Anonymously. Execute with Trust.',
  description:
    "India's most trusted interior execution marketplace. AI designs, anonymous bidding, escrow-backed milestones. Every project governed end-to-end.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-500 relative overflow-x-hidden">
      <GrainOverlay />
      <CursorSpotlight />
      <JourneyProgress />
      <PublicHeader />

      <main className="animate-page-in">
        {/* 1. Hero — the hook */}
        <HeroSection />

        {/* 2. Social proof — instant credibility */}
        <SocialProofBar />

        {/* 3. Story journey — the centerpiece, 3 persona journeys */}
        <StoryJourneySection />

        {/* 4. Marketplace — browse live projects like Amazon */}
        <MarketplaceSection />

        {/* 5. How it works — 4-step visual flow */}
        <HowItWorksSection />

        {/* 6. Trust — 5 pillars + escrow feature */}
        <TrustSection />

        {/* 7. Testimonials — real people, real avatars */}
        <TestimonialsSection />

        {/* 8. CTA — conversion */}
        <CTASection />
      </main>

      <PublicFooter />
    </div>
  );
}
