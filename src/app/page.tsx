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
          // Add social media profiles when available
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
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
