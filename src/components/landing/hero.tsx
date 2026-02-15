'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users } from 'lucide-react'

export function Hero() {
  const { t, isRTL } = useLanguage()
  const [stats, setStats] = useState<{ userCount: number } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              {t('pages.home.hero.title')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              {t('pages.home.hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <SignedOut>
                <SignUpButton>
                  <button type="button" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200">
                    {t('pages.home.hero.cta')}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200">
                  {t('nav.dashboard')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              </SignedIn>
              <a href="#templates" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200">
                {t('pages.home.hero.secondaryCta')}
              </a>
            </div>
            {stats && stats.userCount > 0 && (
              <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{t('pages.home.hero.trust', { count: String(stats.userCount) })}</span>
              </div>
            )}
          </div>

          {/* Resume preview cards */}
          <div className={`mt-12 lg:mt-0 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/60 overflow-hidden border border-gray-100 p-2">
                <Image src="/thumbnails/modern.svg" alt="Resume template preview" width={300} height={400} className="w-full h-auto rounded-lg" priority />
              </div>
              <div className={`absolute -bottom-6 ${isRTL ? '-left-6 sm:-left-12' : '-right-6 sm:-right-12'} w-32 sm:w-40 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 transform rotate-3`}>
                <Image src="/thumbnails/elegant.svg" alt="Resume template" width={150} height={200} className="w-full h-auto rounded-lg" />
              </div>
              <div className={`absolute -top-4 ${isRTL ? '-right-4 sm:-right-8' : '-left-4 sm:-left-8'} w-28 sm:w-36 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 transform -rotate-6`}>
                <Image src="/thumbnails/creative.svg" alt="Resume template" width={150} height={200} className="w-full h-auto rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
