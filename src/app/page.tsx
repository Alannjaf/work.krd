import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Pricing } from '@/components/landing/pricing'
import { About } from '@/components/landing/about'
import { Contact } from '@/components/landing/contact'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}
