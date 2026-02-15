'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { X, Monitor, Megaphone, GraduationCap, Briefcase, Palette, type LucideIcon } from 'lucide-react'

interface QuickStartPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (templateId: string) => void
}

interface QuickStartTemplate {
  id: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
}

const templates: QuickStartTemplate[] = [
  { id: 'software-engineer', icon: Monitor, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'hover:border-blue-400' },
  { id: 'marketing-sales', icon: Megaphone, color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'hover:border-orange-400' },
  { id: 'fresh-graduate', icon: GraduationCap, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'hover:border-green-400' },
  { id: 'business-management', icon: Briefcase, color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'hover:border-purple-400' },
  { id: 'creative-design', icon: Palette, color: 'text-pink-600', bgColor: 'bg-pink-100', borderColor: 'hover:border-pink-400' },
]

export function QuickStartPicker({ isOpen, onClose, onSelect }: QuickStartPickerProps) {
  const { t } = useLanguage()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length === 0) return
      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement
    document.addEventListener('keydown', handleKeyDown)

    requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickstart-title"
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 id="quickstart-title" className="text-xl font-bold text-gray-900">
            {t('pages.resumeBuilder.quickStart.title')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('pages.resumeBuilder.quickStart.subtitle')}
          </p>
        </div>

        {/* Template grid */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((template) => {
            const Icon = template.icon
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template.id)}
                className={`flex items-start gap-3 p-4 rounded-lg border border-gray-200 text-left transition-all hover:shadow-md ${template.borderColor}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${template.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${template.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm">
                    {t(`pages.resumeBuilder.quickStart.templates.${template.id}.name`)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {t(`pages.resumeBuilder.quickStart.templates.${template.id}.description`)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer — start blank */}
        <div className="px-6 pb-6 pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
          >
            {t('pages.resumeBuilder.quickStart.startBlank')}
          </button>
        </div>
      </div>
    </div>
  )
}
