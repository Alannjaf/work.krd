'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Layout, PenTool, Download } from 'lucide-react'

const steps = [
  { icon: Layout, key: 'step1', number: '1' },
  { icon: PenTool, key: 'step2', number: '2' },
  { icon: Download, key: 'step3', number: '3' },
]

export function HowItWorks() {
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
    <section id="how-it-works" ref={sectionRef} className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {t('pages.home.howItWorks.title')}
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.key}
                className={`relative text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${200 + index * 200}ms` }}
              >
                <div className="relative inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-blue-50 rounded-full" />
                  <div className="relative flex flex-col items-center">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{step.number}</span>
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(`pages.home.howItWorks.${step.key}.title`)}
                </h3>
                <p className="text-gray-600 max-w-xs mx-auto leading-relaxed">
                  {t(`pages.home.howItWorks.${step.key}.desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
