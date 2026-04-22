import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — Decoqo',
  description: 'Sign in to your Decoqo account to manage your interior design projects.',
};

export default function LoginPage() {
  return <LoginForm />;
}
