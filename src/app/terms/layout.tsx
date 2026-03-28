import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for Work.krd — rules and guidelines for using our AI-powered resume builder platform.',
  alternates: {
    canonical: 'https://work.krd/terms',
  },
  openGraph: {
    title: 'Terms of Service | Work.krd',
    description:
      'Terms of service for Work.krd — rules and guidelines for using our resume builder.',
    url: 'https://work.krd/terms',
    type: 'website',
    siteName: 'Work.krd',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
