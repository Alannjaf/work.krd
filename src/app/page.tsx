import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Templates } from '@/components/landing/templates'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { FinalCTA } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Templates />
      <HowItWorks />
      <Features />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}
