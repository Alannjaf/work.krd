'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const templates = [
  { id: 'modern', name: 'Modern Professional' },
  { id: 'elegant', name: 'Elegant Dark' },
  { id: 'bold', name: 'Bold Creative' },
  { id: 'developer', name: 'Developer' },
  { id: 'creative', name: 'Creative' },
]

export function Templates() {
  const { t, isRTL } = useLanguage()
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
    <section id="templates" ref={sectionRef} className="py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('pages.home.templates.title')}
          </h2>
          <p className={`mt-4 text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('pages.home.templates.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className={`group transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-2">
                <Image src={`/thumbnails/${template.id}.svg`} alt={template.name} width={300} height={400} className="w-full h-auto rounded-lg" />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700 text-center">{template.name}</p>
            </div>
          ))}
        </div>

        <div className={`mt-10 sm:mt-14 text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <SignedOut>
            <SignUpButton>
              <button type="button" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                {t('pages.home.templates.viewAll')}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/resume-builder" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              {t('pages.home.templates.viewAll')}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  )
}
