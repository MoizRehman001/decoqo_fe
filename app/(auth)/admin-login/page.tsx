import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login — Decoqo',
  description: 'Secure admin access to the Decoqo platform.',
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
