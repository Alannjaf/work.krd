import type { Metadata } from 'next'
import { generateHreflangAlternates } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Digital Services for Kurdish Businesses | work.krd',
  description:
    'Professional digital services for Kurdish businesses in Erbil and Iraq — online stores, automated content creation, and AI consulting. Transform your business with modern technology.',
  keywords: [
    'digital services Kurdistan',
    'online store Erbil',
    'automated content',
    'AI consulting Iraq',
    'Kurdish business',
    'e-commerce Kurdistan',
    'digital transformation Erbil',
  ],
  openGraph: {
    title: 'Digital Services for Kurdish Businesses | work.krd',
    description:
      'Online stores, automated content, and AI consulting for businesses in Erbil and Kurdistan Region. Get a professional digital presence.',
    url: 'https://work.krd/services',
    type: 'website',
    siteName: 'Work.krd',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Work.krd Digital Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Services for Kurdish Businesses | work.krd',
    description:
      'Online stores, automated content, and AI consulting for businesses in Erbil and Kurdistan.',
    images: ['/og-image.png'],
    creator: '@workkrd',
  },
  alternates: generateHreflangAlternates('/services'),
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
