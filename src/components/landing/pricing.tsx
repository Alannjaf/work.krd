'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { Check } from 'lucide-react'

const freeFeatures = ['f1', 'f2', 'f3', 'f4', 'f5']
const proFeatures = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']

export function Pricing() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="pricing" ref={sectionRef} className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('pages.home.pricing.title')}
          </h2>
          <p className={`mt-4 text-lg text-gray-600 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('pages.home.pricing.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free plan */}
          <div
            className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {t('pages.home.pricing.free.name')}
            </h3>
            <div className="mt-4 flex items-baseline gap-1 h-12">
              <span className="text-4xl font-bold text-gray-900">
                {t('pages.home.pricing.free.price')}
              </span>
              <span className="text-gray-500">{t('pages.home.pricing.pro.currency')}</span>
            </div>
            <ul className="mt-8 space-y-3">
              {freeFeatures.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{t(`pages.home.pricing.free.${key}`)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <SignedOut>
                <SignUpButton>
                  <button type="button" className="w-full py-3 px-6 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    {t('pages.home.pricing.free.cta')}
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="block w-full py-3 px-6 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center">
                  {t('nav.dashboard')}
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* Pro plan */}
          <div
            className={`relative bg-white rounded-2xl border-2 border-blue-600 p-8 shadow-lg shadow-blue-100 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '350ms' }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center px-4 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                {t('pages.home.pricing.pro.popular')}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t('pages.home.pricing.pro.name')}
            </h3>
            <div className="mt-4 flex items-baseline gap-1 h-12">
              <span className="text-4xl font-bold text-gray-900">
                {t('pages.home.pricing.pro.price')}
              </span>
              <span className="text-gray-500">
                {t('pages.home.pricing.pro.currency')}/{t('pages.home.pricing.pro.period')}
              </span>
            </div>
            <ul className="mt-8 space-y-3">
              {proFeatures.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{t(`pages.home.pricing.pro.${key}`)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <SignedOut>
                <SignUpButton>
                  <button type="button" className="w-full py-3 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all">
                    {t('pages.home.pricing.pro.cta')}
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/billing" className="block w-full py-3 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-center">
                  {t('pages.home.pricing.pro.cta')}
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>

        <p className={`mt-8 text-center text-sm text-gray-500 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {t('pages.home.pricing.noCreditCard')}
        </p>
      </div>
    </section>
  )
}
