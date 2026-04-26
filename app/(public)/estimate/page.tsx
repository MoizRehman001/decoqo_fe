import type { Metadata } from 'next';
import { CostEstimator } from '@/components/public/CostEstimator';

export const metadata: Metadata = {
  title: 'Project Cost Estimator — Decoqo',
  description: 'Calculate your interior project cost instantly. Get a realistic budget estimate based on your space, city, and quality level.',
};

export default function EstimatePage() {
  return <CostEstimator />;
}
