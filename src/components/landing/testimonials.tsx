'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Star } from 'lucide-react'

const reviews = [
  { key: 't1', initials: 'AK', color: 'bg-blue-500' },
  { key: 't2', initials: 'SM', color: 'bg-purple-500' },
  { key: 't3', initials: 'DH', color: 'bg-emerald-500' },
]

export function Testimonials() {
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
    <section ref={sectionRef} className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('pages.home.testimonials.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('pages.home.testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.key}
              className={`bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6">
                &ldquo;{t(`pages.home.testimonials.reviews.${review.key}.quote`)}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${review.color}`}>
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {t(`pages.home.testimonials.reviews.${review.key}.name`)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t(`pages.home.testimonials.reviews.${review.key}.role`)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
