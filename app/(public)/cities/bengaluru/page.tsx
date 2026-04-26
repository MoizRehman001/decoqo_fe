import type { Metadata } from 'next';
import { CityLandingPage } from '@/components/public/CityLandingPage';

export const metadata: Metadata = {
  title: 'Interior Design in Bengaluru — Decoqo',
  description: 'Find verified interior vendors in Bengaluru. 840+ projects completed. Anonymous bidding, escrow-backed milestones, AI designs.',
};

const BENGALURU_DATA = {
  name: 'Bengaluru',
  state: 'Karnataka',
  heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85',
  projectCount: 840,
  vendorCount: 120,
  avgRating: 4.7,
  totalEscrowPaise: 7200000000,
  topNeighbourhoods: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Bannerghatta Road', 'Electronic City', 'Sarjapur Road'],
  popularSpaces: ['Full Home', 'Modular Kitchen', 'Living Room', 'Bedroom', 'Office', 'Wardrobe'],
  featuredProjects: [
    { title: '3BHK Full Home — Koramangala', budget: '₹18L – ₹22L', status: 'Completed', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80' },
    { title: 'Modular Kitchen — Indiranagar', budget: '₹6L – ₹9L', status: 'In Progress', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80' },
    { title: 'Office Interior — Whitefield', budget: '₹25L – ₹40L', status: 'Completed', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80' },
  ],
};

export default function BengaluruPage() {
  return <CityLandingPage city={BENGALURU_DATA} />;
}
