'use client'

import { RefObject } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { AIProfessionalSummary } from '@/components/ai/AIProfessionalSummary'
import { ResumeData } from '@/types/resume'
import { SectionHeader } from '@/components/resume-builder/shared/SectionHeader'

interface SummarySectionProps {
  formData: ResumeData
  updateSummary: (summary: string) => void
  summaryTextareaRef: RefObject<HTMLTextAreaElement | null>
}

export function SummarySection({
  formData,
  updateSummary,
  summaryTextareaRef
}: SummarySectionProps) {
  const { t } = useLanguage()

  const charCount = formData.summary?.length || 0

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Professional Summary"
        description="A brief overview of your experience and key qualifications"
      />

      {/* AI Generate button */}
      <AIProfessionalSummary
        currentSummary={formData.summary}
        onAccept={(summary) => {
          updateSummary(summary)
          summaryTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          summaryTextareaRef.current?.focus()
        }}
        experience={formData.experience || []}
        skills={formData.skills || []}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-400 text-xs">{t('pages.resumeBuilder.ai.orWriteManually')}</span>
        </div>
      </div>

      {/* Textarea */}
      <div>
        <textarea
          ref={summaryTextareaRef}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
          rows={6}
          placeholder={t('forms.professionalSummary.placeholder')}
          value={formData.summary}
          onChange={(e) => updateSummary(e.target.value)}
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${charCount > 500 ? 'text-amber-600' : 'text-gray-400'}`}>
            {charCount} characters
          </span>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>{t('common.tip')}:</strong> {t('forms.professionalSummary.tip')}
        </p>
      </div>
    </div>
  )
}
