'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Shield, Lock, Award, Users, Globe, FileCheck } from 'lucide-react'

const badges = [
  { key: 'b1', icon: Shield },
  { key: 'b2', icon: Lock },
  { key: 'b3', icon: Award },
  { key: 'b4', icon: Users },
  { key: 'b5', icon: Globe },
  { key: 'b6', icon: FileCheck },
]

export function LogosBar() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-white py-12 sm:py-16 border-y border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p
          className="text-center text-gray-400 uppercase tracking-wider text-sm mb-8 transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          {t('pages.home.logosBar.title')}
        </p>
        <div
          className="flex flex-wrap justify-center gap-8 sm:gap-12 transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '200ms'
          }}
        >
          {badges.map((badge) => {
            const Icon = badge.icon
            return (
              <div key={badge.key} className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-300" />
                <span className="text-sm text-gray-400">
                  {t(`pages.home.logosBar.badges.${badge.key}`)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
