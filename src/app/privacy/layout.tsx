import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for Work.krd — how we collect, use, and protect your personal data when using our resume builder service.',
  alternates: {
    canonical: 'https://work.krd/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Work.krd',
    description:
      'Privacy policy for Work.krd — how we collect, use, and protect your personal data.',
    url: 'https://work.krd/privacy',
    type: 'website',
    siteName: 'Work.krd',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
