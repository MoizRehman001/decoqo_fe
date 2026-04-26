import type { Metadata } from 'next';
import { ExploreProjectsPage } from '@/components/public/ExploreProjects';

export const metadata: Metadata = {
  title: 'Explore Projects — Decoqo',
  description:
    'Browse live interior projects across India. Filter by city, space type, and budget. See how Decoqo governs real projects end-to-end.',
};

export default function ExplorePage() {
  return <ExploreProjectsPage />;
}
