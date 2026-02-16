'use client'

import { useRef, useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SignUpButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'

const templates = [
  { id: 'modern', name: 'Modern Professional' },
  { id: 'elegant', name: 'Elegant Dark' },
  { id: 'bold', name: 'Bold Creative' },
  { id: 'developer', name: 'Developer' },
  { id: 'creative', name: 'Creative' },
  { id: 'basic', name: 'Basic' },
]

export function TemplateCarousel() {
  const { t, isRTL } = useLanguage()
  const { isSignedIn } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 280
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section
      ref={sectionRef}
      className="bg-gray-900 py-20 sm:py-28"
    >
      <style>{'.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }'}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center mb-12 transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('pages.home.templateCarousel.title')}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('pages.home.templateCarousel.subtitle')}
          </p>
        </div>

        <div
          className="relative transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '200ms'
          }}
        >
          {/* Left arrow */}
          <button
            onClick={() => scroll(isRTL ? 'right' : 'left')}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
            style={{ [isRTL ? 'right' : 'left']: -20 }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll(isRTL ? 'left' : 'right')}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
            style={{ [isRTL ? 'left' : 'right']: -20 }}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-6 overflow-x-auto py-4 px-2"
            style={{
              scrollSnapType: 'x mandatory',
            }}
          >
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex-shrink-0"
                style={{ scrollSnapAlign: 'center' }}
              >
                <div className="bg-white rounded-xl p-2 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <Image
                    src={`/thumbnails/${template.id}.svg`}
                    alt={template.name}
                    width={240}
                    height={320}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-gray-300 text-sm text-center mt-3 font-medium">
                  {template.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="text-center mt-12 transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '400ms'
          }}
        >
          {isSignedIn ? (
            <Link
              href="/resume-builder"
              className="inline-flex items-center px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              {t('pages.home.templateCarousel.browseAll')}
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
                {t('pages.home.templateCarousel.browseAll')}
              </button>
            </SignUpButton>
          )}
        </div>
      </div>
    </section>
  )
}
