'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Compass, Sparkles, Link2 } from 'lucide-react'

const cards = [
  { key: 'guidance', icon: Compass, color: 'text-blue-600 bg-blue-50' },
  { key: 'aiWriter', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
  { key: 'jobMatch', icon: Link2, color: 'text-emerald-600 bg-emerald-50' },
]

export function AIFeatures() {
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
    <section ref={sectionRef} className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('pages.home.aiFeatures.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('pages.home.aiFeatures.subtitle')}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={card.key}
                className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: isVisible ? `${200 + index * 150}ms` : '0ms' }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${card.color} mb-5`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(`pages.home.aiFeatures.cards.${card.key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`pages.home.aiFeatures.cards.${card.key}.desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
