import type { Metadata } from 'next';
import { CityLandingPage } from '@/components/public/CityLandingPage';

export const metadata: Metadata = {
  title: 'Interior Design in Mumbai — Decoqo',
  description: 'Find verified interior vendors in Mumbai. 620+ projects completed. Anonymous bidding, escrow-backed milestones, AI designs.',
};

const MUMBAI_DATA = {
  name: 'Mumbai',
  state: 'Maharashtra',
  heroImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85',
  projectCount: 620,
  vendorCount: 95,
  avgRating: 4.6,
  totalEscrowPaise: 5800000000,
  topNeighbourhoods: ['Bandra West', 'Juhu', 'Andheri', 'Powai', 'Worli', 'Lower Parel', 'Goregaon', 'Malad'],
  popularSpaces: ['Modular Kitchen', 'Living Room', 'Bedroom', 'Full Home', 'Office', 'Commercial'],
  featuredProjects: [
    { title: 'Modular Kitchen — Bandra West', budget: '₹5L – ₹8L', status: 'Completed', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80' },
    { title: 'Luxury Bedroom — Juhu', budget: '₹8L – ₹14L', status: 'In Progress', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80' },
    { title: 'Corporate Office — Lower Parel', budget: '₹30L – ₹60L', status: 'Completed', imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80' },
  ],
};

export default function MumbaiPage() {
  return <CityLandingPage city={MUMBAI_DATA} />;
}
