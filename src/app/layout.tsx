import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Qarvon CRM | O CRM do Varejo',
  description: 'A boilerplate project with Next.js and Tailwind CSS',
  icons: {
    icon: [
      { url: '/favicon.webp', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
</body>
    </html>
  );
}
