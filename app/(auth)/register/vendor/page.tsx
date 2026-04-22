import type { Metadata } from 'next';
import { VendorRegisterForm } from '@/components/auth/VendorRegisterForm';

export const metadata: Metadata = {
  title: 'Register as Vendor — Decoqo',
  description: 'Join Decoqo as a verified interior design vendor and grow your business.',
};

export default function VendorRegisterPage() {
  return <VendorRegisterForm />;
}
