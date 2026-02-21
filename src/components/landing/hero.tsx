'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, Check, Sparkles, Upload } from 'lucide-react'

const TRUST_PERCENT = '39'

export function Hero() {
  const { t, isRTL } = useLanguage()
  const [stats, setStats] = useState<{ userCount: number } | null>(null)
  const [statsError, setStatsError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    fetch('/api/stats/public')
      .then(res => { if (!res.ok) throw new Error('fetch failed'); return res.json() })
      .then(data => { setStats(data); setStatsError(false) })
      .catch(() => setStatsError(true))
  }, [])

  const circumference = 2 * Math.PI * 20
  const scorePercent = 0.81

  return (
    <section className="relative overflow-hidden pt-8 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column — Text */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              {t('pages.home.hero.titleBefore')}
              <span className="text-blue-600">{t('pages.home.hero.titleHighlight')}</span>
              {t('pages.home.hero.titleAfter')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              {t('pages.home.hero.subtitle')}
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <SignedOut>
                <SignUpButton>
                  <button type="button" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200">
                    {t('pages.home.hero.cta')}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </SignUpButton>
                <SignUpButton>
                  <button type="button" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all duration-200">
                    <Upload className="w-5 h-5" />
                    {t('pages.home.hero.uploadCta')}
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200">
                  {t('pages.home.hero.cta')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
                <Link href="/resume-builder/import" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all duration-200">
                  <Upload className="w-5 h-5" />
                  {t('pages.home.hero.uploadCta')}
                </Link>
              </SignedIn>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span>{t('pages.home.hero.trustStat', { percent: TRUST_PERCENT })}</span>
              </div>
              {stats && stats.userCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{t('pages.home.hero.trust', { count: String(stats.userCount) })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Floating Resume Card */}
          <div className={`mt-12 lg:mt-0 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative mx-auto max-w-sm">
              {/* Main resume card */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3">
                <Image
                  src="/thumbnails/modern.svg"
                  alt="Resume preview"
                  width={300}
                  height={400}
                  className="w-full h-auto rounded-xl"
                  priority
                />
              </div>

              {/* Badge 1: Resume Score (top-start) */}
              <div
                className={`absolute -top-4 -start-4 sm:-start-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '0.4s' }}
              >
                <div className="animate-float bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-2" style={{ animationDelay: '0.4s' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeDasharray={`${circumference * scorePercent} ${circumference * (1 - scorePercent)}`}
                      strokeDashoffset={circumference * 0.25}
                      strokeLinecap="round"
                    />
                    <text x="24" y="24" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold fill-gray-900">{Math.round(scorePercent * 100)}%</text>
                  </svg>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{Math.round(scorePercent * 100)}%</div>
                    <div className="text-xs text-gray-500">{t('pages.home.hero.resumeScore')}</div>
                  </div>
                </div>
              </div>

              {/* Badge 2: ATS Perfect (end side) */}
              <div
                className={`absolute top-1/3 -end-4 sm:-end-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '0.6s' }}
              >
                <div className="animate-float bg-emerald-50 text-emerald-700 rounded-full px-4 py-2 shadow-lg border border-emerald-200 flex items-center gap-2 text-sm font-medium" style={{ animationDelay: '0.6s' }}>
                  <Check className="w-4 h-4" />
                  {t('pages.home.hero.atsReady')}
                </div>
              </div>

              {/* Badge 3: Skills Card (bottom-end) — hidden on mobile */}
              <div
                className={`absolute -bottom-4 -end-4 sm:-end-10 hidden sm:block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '0.8s' }}
              >
                <div className="animate-float bg-white rounded-xl shadow-lg border border-gray-100 p-3" style={{ animationDelay: '0.8s' }}>
                  <div className="text-xs font-medium text-gray-500 mb-2">{t('pages.home.hero.skillsLabel')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">React</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">Node.js</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{t('pages.home.hero.addSkill')}</span>
                  </div>
                </div>
              </div>

              {/* Badge 4: AI Coach bar (bottom center) — hidden on mobile */}
              <div
                className={`absolute -bottom-12 left-1/2 -translate-x-1/2 hidden sm:block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '1s' }}
              >
                <div className="animate-float bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2 whitespace-nowrap" style={{ animationDelay: '1s' }}>
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-400">{t('pages.home.hero.aiCoach')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
