import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Impact — Academic Decision Platform',
    template: '%s | Impact',
  },
  description:
    'Understand the financial, academic, and graduation impact of your academic decisions before you make them.',
  keywords: ['academic planning', 'financial aid', 'course simulation', 'student success'],
  openGraph: {
    title: 'Impact — Academic Decision Platform',
    description: 'Simulate academic decisions. Understand the consequences. Make informed choices.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0d0d1a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[--color-surface] text-[--color-text-primary] antialiased">
        {children}
      </body>
    </html>
  );
}
