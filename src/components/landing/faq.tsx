'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronDown } from 'lucide-react'

const faqItems = [
  { key: 'q1' },
  { key: 'q2' },
  { key: 'q3' },
  { key: 'q4' },
  { key: 'q5' },
  { key: 'q6' },
]

export function FAQ() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('pages.home.faq.title')}
          </h2>
        </div>

        <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {faqItems.map((item) => (
            <div key={item.key} className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => toggleItem(item.key)}
                className="flex items-center justify-between w-full py-5"
              >
                <span className="text-base font-medium text-gray-900">
                  {t(`pages.home.faq.items.${item.key}.question`)}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ms-4 ${openItems.has(item.key) ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ${openItems.has(item.key) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <p className="text-gray-600 leading-relaxed pb-5">
                    {t(`pages.home.faq.items.${item.key}.answer`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
