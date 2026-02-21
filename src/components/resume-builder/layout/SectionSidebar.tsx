'use client'

import { useRef, useCallback } from 'react'
import { User, FileText, Briefcase, GraduationCap, Zap, FolderOpen } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const SECTION_ICONS = [
  { id: 'personal', icon: User, tooltipKey: 'pages.resumeBuilder.sidebar.aboutYou' },
  { id: 'summary', icon: FileText, tooltipKey: 'pages.resumeBuilder.sidebar.summary' },
  { id: 'experience', icon: Briefcase, tooltipKey: 'pages.resumeBuilder.sidebar.experience' },
  { id: 'education', icon: GraduationCap, tooltipKey: 'pages.resumeBuilder.sidebar.education' },
  { id: 'skills-languages', icon: Zap, tooltipKey: 'pages.resumeBuilder.sidebar.skillsAndLanguages' },
  { id: 'additional', icon: FolderOpen, tooltipKey: 'pages.resumeBuilder.sidebar.additional' },
]

interface SectionSidebarProps {
  currentSection: number
  onSectionChange: (index: number) => void
  completionStatus?: Record<number, number>
}

export function SectionSidebar({ currentSection, onSectionChange, completionStatus = {} }: SectionSidebarProps) {
  const { t } = useLanguage()
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const total = SECTION_ICONS.length
    let nextIndex: number | null = null

    if (e.key === 'ArrowDown') {
      nextIndex = (index + 1) % total
    } else if (e.key === 'ArrowUp') {
      nextIndex = (index - 1 + total) % total
    }

    if (nextIndex !== null) {
      e.preventDefault()
      buttonRefs.current[nextIndex]?.focus()
      onSectionChange(nextIndex)
    }
  }, [onSectionChange])

  return (
    <nav
      className="hidden lg:flex flex-col items-center w-16 bg-white border-e border-gray-200 py-4 gap-1 shrink-0"
      role="tablist"
      aria-orientation="vertical"
    >
      {SECTION_ICONS.map((section, index) => {
        const Icon = section.icon
        const isActive = index === currentSection
        const completion = completionStatus[index] ?? 0

        return (
          <button
            type="button"
            key={section.id}
            ref={(el) => { buttonRefs.current[index] = el }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSectionChange(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative w-12 h-12 rounded-lg flex items-center justify-center transition-all group ${
              isActive
                ? 'bg-primary/10 text-primary border-s-2 border-primary'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={t(section.tooltipKey)}
            aria-label={t(section.tooltipKey)}
          >
            <Icon className="h-5 w-5" />

            {/* Completion dot */}
            {completion > 0 && (
              <span
                className={`absolute top-1.5 end-1.5 w-2 h-2 rounded-full ${
                  completion >= 100 ? 'bg-green-500' : completion >= 50 ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              />
            )}

            {/* Tooltip */}
            <span className="absolute start-full ms-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {t(section.tooltipKey)}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
