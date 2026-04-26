import type { Metadata } from 'next';
import { PricingPage } from '@/components/public/PricingPage';

export const metadata: Metadata = {
  title: 'Pricing — Decoqo',
  description:
    'Transparent pricing for customers and vendors. Customers pay zero platform fee. Vendors pay a small success fee only on completed projects.',
};

export default function Pricing() {
  return <PricingPage />;
}
