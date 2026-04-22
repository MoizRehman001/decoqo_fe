import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider, themeScript } from '@/components/layout/ThemeProvider';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Decoqo — India\'s Most Trusted Interior Execution Marketplace',
    template: '%s | Decoqo',
  },
  description:
    'Design any space. Bid anonymously. Execute with trust. Decoqo connects homeowners with verified interior vendors through AI-powered design and secure escrow payments.',
  keywords: ['interior design', 'home renovation', 'interior vendors', 'escrow', 'India'],
  authors: [{ name: 'Decoqo' }],
  creator: 'Decoqo',
  metadataBase: new URL('https://decoqo.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://decoqo.com',
    siteName: 'Decoqo',
    title: 'Decoqo — India\'s Most Trusted Interior Execution Marketplace',
    description:
      'Design any space. Bid anonymously. Execute with trust.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decoqo — Interior Execution Marketplace',
    description: 'Design any space. Bid anonymously. Execute with trust.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash script — must be first to prevent theme flicker */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
