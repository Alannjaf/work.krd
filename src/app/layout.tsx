import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://work.krd'),
  title: {
    default: 'Work.krd - Create Professional Resumes with AI',
    template: '%s | Work.krd',
  },
  description: 'Build stunning resumes with AI assistance in multiple languages including Kurdish, Arabic, and English. Choose from professional templates, optimize for ATS, and download your resume instantly.',
  keywords: ['resume builder', 'CV creator', 'Kurdish resume', 'Arabic resume', 'ATS optimization', 'professional resume', 'AI resume builder'],
  authors: [{ name: 'Work.krd' }],
  creator: 'Work.krd',
  publisher: 'Work.krd',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_AR', 'ku_IQ'],
    url: 'https://work.krd',
    title: 'Work.krd - Create Professional Resumes with AI',
    description: 'Build stunning resumes with AI assistance in multiple languages including Kurdish, Arabic, and English. Choose from professional templates, optimize for ATS, and download your resume instantly.',
    siteName: 'Work.krd',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Work.krd - Professional Resume Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work.krd - Create Professional Resumes with AI',
    description: 'Build stunning resumes with AI assistance in multiple languages including Kurdish, Arabic, and English.',
    images: ['/og-image.png'],
    creator: '@workkrd',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification tokens when available
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/onboarding"
    >
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://clerk.com" />
        </head>
        <body className={inter.className}>
          <SubscriptionProvider>
            <LanguageProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff'},
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4aed88',
                      secondary: '#fff'}},
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ff4b4b',
                      secondary: '#fff'}}}}
              />
            </LanguageProvider>
          </SubscriptionProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}