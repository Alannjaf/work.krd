'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  const { t, isRTL } = useLanguage()

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          {t('pages.home.finalCta.title')}
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
          {t('pages.home.finalCta.subtitle')}
        </p>
        <div className="mt-10">
          <SignedOut>
            <SignUpButton>
              <button type="button" className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-lg transition-all duration-200">
                {t('pages.home.finalCta.button')}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-lg transition-all duration-200">
              {t('nav.dashboard')}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  )
}
