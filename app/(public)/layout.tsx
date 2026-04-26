import type { ReactNode } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <PublicHeader />
      <main className="pt-16 animate-page-in">{children}</main>
      <PublicFooter />
    </div>
  );
}
