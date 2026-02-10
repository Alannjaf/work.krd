'use client'

import { User, FileText, Briefcase, GraduationCap, Zap, FolderOpen } from 'lucide-react'

const SECTIONS = [
  { id: 'personal', icon: User, tooltip: 'About You' },
  { id: 'summary', icon: FileText, tooltip: 'Summary' },
  { id: 'experience', icon: Briefcase, tooltip: 'Experience' },
  { id: 'education', icon: GraduationCap, tooltip: 'Education' },
  { id: 'skills-languages', icon: Zap, tooltip: 'Skills & Languages' },
  { id: 'additional', icon: FolderOpen, tooltip: 'Additional' },
]

interface SectionSidebarProps {
  currentSection: number
  onSectionChange: (index: number) => void
  completionStatus?: Record<number, number> // 0-100 per section
}

export function SectionSidebar({ currentSection, onSectionChange, completionStatus = {} }: SectionSidebarProps) {
  return (
    <nav className="hidden lg:flex flex-col items-center w-16 bg-white border-r border-gray-200 py-4 gap-1 shrink-0">
      {SECTIONS.map((section, index) => {
        const Icon = section.icon
        const isActive = index === currentSection
        const completion = completionStatus[index] ?? 0

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(index)}
            className={`relative w-12 h-12 rounded-lg flex items-center justify-center transition-all group ${
              isActive
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={section.tooltip}
          >
            <Icon className="h-5 w-5" />

            {/* Completion dot */}
            {completion > 0 && (
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  completion >= 100 ? 'bg-green-500' : completion >= 50 ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              />
            )}

            {/* Tooltip */}
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {section.tooltip}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
