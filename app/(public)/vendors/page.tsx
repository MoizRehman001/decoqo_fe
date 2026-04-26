import type { Metadata } from 'next';
import { VendorsGalleryPage } from '@/components/public/VendorsGallery';

export const metadata: Metadata = {
  title: 'Verified Vendors — Decoqo',
  description:
    'Browse KYC-verified interior vendors across India. Filter by city, specialisation, and rating. All vendors are background-checked and escrow-ready.',
};

export default function VendorsPage() {
  return <VendorsGalleryPage />;
}
