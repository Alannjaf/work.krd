'use client'

import { User, FileText, Briefcase, GraduationCap, Zap, FolderOpen } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const SECTION_ICONS = [
  { id: 'personal', icon: User, labelKey: 'pages.resumeBuilder.mobileNav.about' },
  { id: 'summary', icon: FileText, labelKey: 'pages.resumeBuilder.mobileNav.summary' },
  { id: 'experience', icon: Briefcase, labelKey: 'pages.resumeBuilder.mobileNav.work' },
  { id: 'education', icon: GraduationCap, labelKey: 'pages.resumeBuilder.mobileNav.edu' },
  { id: 'skills-languages', icon: Zap, labelKey: 'pages.resumeBuilder.mobileNav.skills' },
  { id: 'additional', icon: FolderOpen, labelKey: 'pages.resumeBuilder.mobileNav.more' },
]

interface MobileBottomNavProps {
  currentSection: number
  onSectionChange: (index: number) => void
  completionStatus?: Record<number, number>
}

export function MobileBottomNav({ currentSection, onSectionChange, completionStatus = {} }: MobileBottomNavProps) {
  const { t } = useLanguage()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1" role="tablist">
        {SECTION_ICONS.map((section, index) => {
          const Icon = section.icon
          const isActive = index === currentSection
          const completion = completionStatus[index] ?? 0

          return (
            <button
              type="button"
              key={section.id}
              role="tab"
              aria-selected={isActive}
              aria-label={t(section.labelKey)}
              onClick={() => onSectionChange(index)}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {completion > 0 && (
                  <span
                    className={`absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full ${
                      completion >= 100 ? 'bg-green-500' : completion >= 50 ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{t(section.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
