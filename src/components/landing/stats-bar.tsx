'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCountUp } from '@/hooks/useCountUp'
import { FileText, Clock, ShieldCheck, FileSearch, Languages } from 'lucide-react'

const features = [
  { key: 'feature1', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  { key: 'feature2', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'feature3', icon: FileSearch, color: 'text-purple-600 bg-purple-50' },
  { key: 'feature4', icon: Languages, color: 'text-orange-600 bg-orange-50' },
]

export function StatsBar() {
  const { t, language } = useLanguage()
  const [resumeCount, setResumeCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const { ref: counterRef, displayValue } = useCountUp(resumeCount, {
    duration: 2000,
    locale: language,
    enabled: resumeCount > 0,
  })

  useEffect(() => {
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => {
        if (data.resumeCount) setResumeCount(data.resumeCount)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Counter */}
        <div
          ref={counterRef}
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-4xl sm:text-5xl font-bold text-blue-600">{displayValue}</span>
          </div>
          <p className="text-lg text-gray-600">{t('pages.home.statsBar.resumesCreated')}</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.key}
                className={`text-center p-5 sm:p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  {t(`pages.home.statsBar.${feature.key}.title`)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {t(`pages.home.statsBar.${feature.key}.desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
