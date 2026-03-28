'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import {
  Store,
  Wand2,
  BrainCircuit,
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  MapPin,
} from 'lucide-react'

const WHATSAPP_NUMBER = '9647504910348'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, isVisible }
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const duration = 1200
    const steps = 30
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function ServicesPage() {
  const { t, isRTL } = useLanguage()

  const hero = useInView()
  const services = useInView()
  const stats = useInView()
  const trust = useInView()
  const cta = useInView()

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('pages.services.whatsappMessage'))}`

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; btnBg: string; btnHover: string; shadow: string }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
      btnBg: 'bg-blue-600',
      btnHover: 'hover:bg-blue-700',
      shadow: 'shadow-blue-600/25',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
      btnBg: 'bg-purple-600',
      btnHover: 'hover:bg-purple-700',
      shadow: 'shadow-purple-600/25',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      btnBg: 'bg-emerald-600',
      btnHover: 'hover:bg-emerald-700',
      shadow: 'shadow-emerald-600/25',
    },
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero Section — badge removed, copy is Kurdish-specific */}
        <section
          ref={hero.ref as React.RefObject<HTMLElement>}
          className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className={`transition-all duration-700 ${hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                {t('pages.services.hero.titleBefore')}
                <span className="text-blue-600">{t('pages.services.hero.titleHighlight')}</span>
                {t('pages.services.hero.titleAfter')}
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {t('pages.services.hero.subtitle')}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {t('pages.services.hero.location')}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#25D366] hover:bg-[#1fb855] rounded-xl shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('pages.services.hero.whatsappCta')}
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all duration-200"
                >
                  {t('pages.services.hero.learnMore')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section — staggered layout, left-aligned text, pricing in cards */}
        <section
          id="services"
          ref={services.ref as React.RefObject<HTMLElement>}
          className="py-16 sm:py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`mb-12 sm:mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 transition-all duration-700 ${services.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {t('pages.services.section.title')}
              </h2>
              <p className={`mt-4 text-lg text-gray-600 max-w-2xl transition-all duration-700 delay-100 ${services.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {t('pages.services.section.subtitle')}
              </p>
            </div>

            {/* Featured service: Online Store — full width */}
            {(() => {
              const colors = colorMap.blue
              return (
                <div
                  className={`relative bg-white rounded-2xl border-2 ${colors.border} p-8 lg:p-10 mb-8 transition-all duration-500 hover:shadow-xl ${services.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: '200ms' }}
                >
                  <div className="lg:grid lg:grid-cols-5 lg:gap-10 items-start">
                    {/* Left: content */}
                    <div className={`lg:col-span-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Store className={`w-7 h-7 ${colors.text}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {t('pages.services.cards.onlineStore.title')}
                          </h3>
                          <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                            {t('pages.services.cards.onlineStore.popular')}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 leading-relaxed text-base">
                        {t('pages.services.cards.onlineStore.description')}
                      </p>

                      <ul className="space-y-3 mb-6">
                        {['f1', 'f2', 'f3', 'f4'].map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <span className="text-gray-600 text-sm">
                              {t(`pages.services.cards.onlineStore.${f}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: price + CTA */}
                    <div className="lg:col-span-2 flex flex-col items-stretch">
                      <div className={`${colors.bg} rounded-xl p-6 mb-4`}>
                        <p className={`text-sm text-gray-500 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {t('pages.services.cards.startsAt')}
                        </p>
                        <div className={`flex items-baseline gap-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <span className="text-4xl font-bold text-gray-900">
                            {t('pages.services.cards.onlineStore.price')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {t('pages.services.cards.onlineStore.priceUnit')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {t('pages.services.cards.onlineStore.timeline')}
                        </div>
                      </div>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 w-full py-3.5 px-6 text-sm font-semibold text-white ${colors.btnBg} ${colors.btnHover} rounded-xl shadow-lg ${colors.shadow} transition-all`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t('pages.services.cards.orderNow')}
                      </a>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Two smaller cards side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { key: 'automatedContent', icon: Wand2, color: 'purple', features: ['f1', 'f2', 'f3', 'f4'] },
                { key: 'aiConsulting', icon: BrainCircuit, color: 'emerald', features: ['f1', 'f2', 'f3'] },
              ].map((service, index) => {
                const colors = colorMap[service.color]
                const Icon = service.icon
                return (
                  <div
                    key={service.key}
                    className={`relative bg-white rounded-2xl border ${colors.border} p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${services.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${400 + index * 150}ms` }}
                  >
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      {/* Icon + Title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {t(`pages.services.cards.${service.key}.title`)}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {t(`pages.services.cards.${service.key}.description`)}
                      </p>

                      {/* Features */}
                      <ul className="space-y-3 mb-6">
                        {service.features.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <span className="text-gray-600 text-sm">
                              {t(`pages.services.cards.${service.key}.${f}`)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Price — below features */}
                      <div className={`${colors.bg} rounded-xl p-4 mb-6`}>
                        <p className="text-xs text-gray-500 mb-0.5">
                          {t('pages.services.cards.startsAt')}
                        </p>
                        <div className={`flex items-baseline gap-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <span className="text-3xl font-bold text-gray-900">
                            {t(`pages.services.cards.${service.key}.price`)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {t(`pages.services.cards.${service.key}.priceUnit`)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {t(`pages.services.cards.${service.key}.timeline`)}
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 w-full py-3 px-6 text-sm font-semibold text-white ${colors.btnBg} ${colors.btnHover} rounded-xl shadow-lg ${colors.shadow} transition-all`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t('pages.services.cards.orderNow')}
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Social Proof Stats Bar */}
        <section
          ref={stats.ref as React.RefObject<HTMLElement>}
          className="py-12 border-y border-gray-200 bg-white"
        >
          <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${stats.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
              <div className="text-center flex-1">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  <AnimatedCounter target={86} suffix="+" />
                </div>
                <p className="mt-1 text-sm text-gray-500">{t('pages.services.stats.resumes')}</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-200" />
              <div className="text-center flex-1">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  <AnimatedCounter target={500} suffix="+" />
                </div>
                <p className="mt-1 text-sm text-gray-500">{t('pages.services.stats.users')}</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-200" />
              <div className="text-center flex-1">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  <AnimatedCounter target={2} suffix="" />
                </div>
                <p className="mt-1 text-sm text-gray-500">{t('pages.services.stats.channels')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section — inline credential badges */}
        <section
          ref={trust.ref as React.RefObject<HTMLElement>}
          className="py-16 sm:py-24 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 transition-all duration-700 ${trust.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {t('pages.services.trust.title')}
              </h2>
              <p className={`mt-4 text-lg text-gray-600 max-w-2xl transition-all duration-700 delay-100 ${trust.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {t('pages.services.trust.subtitle')}
              </p>
            </div>

            <div className={`flex flex-wrap items-center gap-3 sm:gap-4 transition-all duration-700 delay-200 ${trust.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {[
                { emoji: '\uD83C\uDFE2', key: 'korek' },
                { emoji: '\uD83C\uDFA8', key: 'design' },
                { emoji: '\uD83D\uDCBB', key: 'tools' },
                { emoji: '\uD83D\uDCCD', key: 'location' },
              ].map((badge) => (
                <span
                  key={badge.key}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700"
                >
                  <span>{badge.emoji}</span>
                  {t(`pages.services.trust.badges.${badge.key}`)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Contact / CTA Section */}
        <section
          ref={cta.ref as React.RefObject<HTMLElement>}
          className="py-20 sm:py-28 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-700 ${cta.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {t('pages.services.cta.title')}
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              {t('pages.services.cta.subtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-green-700 bg-white hover:bg-green-50 rounded-xl shadow-lg transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                {t('pages.services.cta.whatsapp')}
              </a>
              <a
                href={`mailto:alan.ahmed@magency.me?subject=${encodeURIComponent(t('pages.services.cta.emailSubject'))}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                {t('pages.services.cta.email')}
              </a>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              {t('pages.services.cta.responseTime')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
