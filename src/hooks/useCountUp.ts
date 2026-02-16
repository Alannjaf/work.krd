'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseCountUpOptions {
  duration?: number     // ms, default 2000
  locale?: string       // for Intl.NumberFormat, e.g. 'en', 'ar', 'ckb'
  enabled?: boolean     // default true, allows external control
}

export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 2000, locale = 'en', enabled = true } = options
  const [displayValue, setDisplayValue] = useState('0')
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const formatNumber = useCallback((n: number) => {
    const SUPPORTED_LOCALES = ['en', 'ar', 'ckb']
    const resolvedLocale = SUPPORTED_LOCALES.includes(locale)
      ? (locale === 'ckb' ? 'ar' : locale)
      : 'en'
    try {
      return new Intl.NumberFormat(resolvedLocale).format(Math.round(n))
    } catch {
      return String(Math.round(n))
    }
  }, [locale])

  useEffect(() => {
    if (!enabled || hasAnimated.current || target <= 0) return

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.disconnect()

          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = eased * target

            setDisplayValue(formatNumber(current))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [target, duration, enabled, formatNumber])

  return { ref, displayValue }
}
