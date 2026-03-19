import { Suspense } from 'react'
import { ReferralCapture } from '@/components/shared/ReferralCapture'
import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { StatsBar } from '@/components/landing/stats-bar'
import { ToolsSection } from '@/components/landing/tools-section'
import { TemplateCarousel } from '@/components/landing/template-carousel'
import { AIFeatures } from '@/components/landing/ai-features'
import { LogosBar } from '@/components/landing/logos-bar'
import { Testimonials } from '@/components/landing/testimonials'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://work.krd/#organization',
        name: 'Work.krd',
        url: 'https://work.krd',
        logo: {
          '@type': 'ImageObject',
          url: 'https://work.krd/logo.png',
        },
        description: 'Professional resume builder with AI assistance, supporting Kurdish, Arabic, and English languages.',
        sameAs: [
          'https://x.com/workkrd',
          'https://www.facebook.com/profile.php?id=843311732209489',
          'https://www.instagram.com/work.krd',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://work.krd/#website',
        url: 'https://work.krd',
        name: 'Work.krd',
        description: 'Build stunning resumes with AI assistance in multiple languages including Kurdish, Arabic, and English.',
        publisher: {
          '@id': 'https://work.krd/#organization',
        },
        inLanguage: ['en', 'ar', 'ckb'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://work.krd/dashboard?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://work.krd/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is work.krd free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! You can create up to 10 resumes, use basic templates, and get 100 AI suggestions completely free. Upgrade to Pro for unlimited access to all features.',
            },
          },
          {
            '@type': 'Question',
            name: 'What languages are supported?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Work.krd fully supports Kurdish (Sorani), Arabic, and English. All templates work perfectly with right-to-left (RTL) text, and you can switch languages anytime.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is ATS and why does it matter?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ATS (Applicant Tracking System) is software companies use to scan resumes before a human sees them. Our templates are optimized to pass these systems, ensuring your resume reaches hiring managers.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I download my resume as PDF?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Absolutely! Export your resume as a professional A4 PDF with perfect formatting. Free users get 20 exports, Pro users get unlimited.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does AI assistance work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our AI analyzes your input and generates professional content suggestions for each section of your resume. It understands context in English, Arabic, and Kurdish.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is my data secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Your data is encrypted and stored securely. We never share your personal information with third parties. You can delete your account and data at any time.',
            },
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://work.krd/#app',
        name: 'Work.krd',
        description: 'AI-powered resume builder supporting Kurdish, Arabic, and English with ATS-optimized templates.',
        url: 'https://work.krd',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: [
          {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            name: 'Free',
            description: 'Up to 10 resumes, basic templates, 100 AI suggestions, 20 PDF exports',
          },
          {
            '@type': 'Offer',
            price: '5000',
            priceCurrency: 'IQD',
            name: 'Pro',
            description: 'Unlimited resumes, all premium templates, unlimited AI suggestions, unlimited PDF exports, ATS optimization',
            priceValidUntil: '2027-12-31',
          },
        ],
        publisher: {
          '@id': 'https://work.krd/#organization',
        },
        inLanguage: ['en', 'ar', 'ckb'],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <main>
        <Header />
        <Hero />
        <StatsBar />
        <ToolsSection />
        <TemplateCarousel />
        <AIFeatures />
        <LogosBar />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  )
}
