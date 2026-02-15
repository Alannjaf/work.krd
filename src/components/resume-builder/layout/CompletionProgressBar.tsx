'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface CompletionProgressBarProps {
  completionStatus: Record<number, number> // section index -> 0-100 completion
  currentSection: number
  onSectionChange: (index: number) => void
}

const SECTION_COUNT = 6

function getColorClass(percent: number): string {
  if (percent >= 100) return 'text-green-600'
  if (percent >= 70) return 'text-blue-500'
  if (percent >= 30) return 'text-amber-500'
  return 'text-red-500'
}

function getBarGradient(percent: number): string {
  if (percent >= 100) return 'bg-gradient-to-r from-green-400 to-green-600'
  if (percent >= 70) return 'bg-gradient-to-r from-blue-400 to-blue-600'
  if (percent >= 30) return 'bg-gradient-to-r from-amber-300 to-amber-500'
  return 'bg-gradient-to-r from-red-300 to-red-500'
}

function getDotColor(percent: number): string {
  if (percent >= 100) return 'bg-green-500'
  if (percent >= 50) return 'bg-blue-400'
  if (percent >= 1) return 'bg-amber-400'
  return 'bg-gray-200'
}

function getEncouragementKey(percent: number): string {
  if (percent >= 100) return 'pages.resumeBuilder.completion.complete'
  if (percent >= 70) return 'pages.resumeBuilder.completion.almostDone'
  if (percent >= 30) return 'pages.resumeBuilder.completion.gettingThere'
  if (percent >= 1) return 'pages.resumeBuilder.completion.goodStart'
  return 'pages.resumeBuilder.completion.getStarted'
}

export function CompletionProgressBar({
  completionStatus,
  currentSection,
  onSectionChange,
}: CompletionProgressBarProps) {
  const { t } = useLanguage()

  const overallPercent = useMemo(() => {
    let total = 0
    for (let i = 0; i < SECTION_COUNT; i++) {
      total += completionStatus[i] ?? 0
    }
    return Math.round(total / SECTION_COUNT)
  }, [completionStatus])

  const colorClass = getColorClass(overallPercent)
  const barGradient = getBarGradient(overallPercent)
  const encouragementKey = getEncouragementKey(overallPercent)

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main bar row */}
      <div className="flex items-center gap-3 px-4 h-10 sm:h-9">
        {/* Percentage text */}
        <span className={`text-xs font-semibold whitespace-nowrap ${colorClass}`}>
          {t('pages.resumeBuilder.completion.label', { percent: String(overallPercent) })}
        </span>

        {/* Progress bar track */}
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barGradient} transition-all duration-500 ease-out`}
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        {/* Encouraging text - hidden on mobile */}
        <span className={`hidden sm:block text-xs whitespace-nowrap ${colorClass}`}>
          {t(encouragementKey)}
        </span>
      </div>

      {/* Section dots - hidden on mobile */}
      <div className="hidden sm:flex items-center justify-center gap-2 pb-1.5">
        {Array.from({ length: SECTION_COUNT }, (_, i) => {
          const sectionPercent = completionStatus[i] ?? 0
          const dotColor = getDotColor(sectionPercent)
          const isActive = i === currentSection

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSectionChange(i)}
              className={`w-2 h-2 rounded-full ${dotColor} transition-colors duration-200 ${
                isActive ? 'ring-2 ring-offset-1 ring-primary' : ''
              }`}
              aria-label={`Section ${i + 1} - ${sectionPercent}%`}
            />
          )
        })}
      </div>
    </div>
  )
}
