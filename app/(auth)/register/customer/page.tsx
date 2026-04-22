import type { Metadata } from 'next';
import { CustomerRegisterForm } from '@/components/auth/CustomerRegisterForm';

export const metadata: Metadata = {
  title: 'Create Customer Account',
  description: 'Create your Decoqo customer account to start your interior design journey.',
};

export default function CustomerRegisterPage() {
  return <CustomerRegisterForm />;
}
