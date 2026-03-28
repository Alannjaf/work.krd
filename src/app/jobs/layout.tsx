import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jobs in Kurdistan — Erbil, Sulaymaniyah, Kirkuk | work.krd',
  description:
    'Find the latest job listings in Kurdistan Region — Erbil, Sulaymaniyah, Kirkuk, and Duhok. Browse jobs from fjik.krd and jobs.krd in one place.',
  keywords: [
    'jobs Kurdistan',
    'jobs Erbil',
    'jobs Sulaymaniyah',
    'jobs Kirkuk',
    'jobs Duhok',
    'Kurdistan job listings',
    'Iraq jobs',
    'Kurdish jobs',
    'fjik.krd',
    'jobs.krd',
  ],
  openGraph: {
    title: 'Jobs in Kurdistan — Erbil, Sulaymaniyah, Kirkuk | work.krd',
    description:
      'Browse the latest job listings across Kurdistan Region. Jobs aggregated from fjik.krd and jobs.krd.',
    url: 'https://work.krd/jobs',
    type: 'website',
    siteName: 'Work.krd',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Work.krd Jobs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs in Kurdistan | work.krd',
    description:
      'Find jobs in Erbil, Sulaymaniyah, Kirkuk, and Duhok — aggregated from fjik.krd and jobs.krd.',
    images: ['/og-image.png'],
    creator: '@workkrd',
  },
  alternates: {
    canonical: 'https://work.krd/jobs',
  },
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
