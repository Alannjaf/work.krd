import { RefObject, forwardRef, useImperativeHandle } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PersonalInfoSection } from './PersonalInfoSection'
import { SummarySection } from './SummarySection'
import { ExperienceSection } from '@/components/resume-builder/sections/ExperienceSection'
import { EducationSection } from '@/components/resume-builder/sections/EducationSection'
import { SkillsLanguagesSection } from '@/components/resume-builder/sections/SkillsLanguagesSection'
import { AdditionalSection } from '@/components/resume-builder/sections/AdditionalSection'
import { ResumeData } from '@/types/resume'
import { SubscriptionPermissions } from '@/types/subscription'

const TOTAL_SECTIONS = 6
const SECTION_LABELS = ['About You', 'Summary', 'Experience', 'Education', 'Skills & Languages', 'Additional']

interface FormSectionRendererProps {
  currentSection: number
  onSectionChange: (section: number) => void
  formData: ResumeData
  updatePersonalField: (field: string, value: string) => void
  updateSummary: (summary: string) => void
  updateSection: (section: keyof ResumeData, data: unknown) => void
  setFormData: (data: ResumeData) => void
  summaryTextareaRef: RefObject<HTMLTextAreaElement | null>
  isAutoSaving: boolean
  queueSave: (sectionType?: string) => void
  checkPermission?: (permission: keyof SubscriptionPermissions) => boolean
}

export interface FormSectionRendererRef {
  triggerSectionSave: () => void
}

export const FormSectionRenderer = forwardRef<FormSectionRendererRef, FormSectionRendererProps>(function FormSectionRenderer({
  currentSection,
  onSectionChange,
  formData,
  updatePersonalField,
  updateSummary,
  updateSection,
  setFormData,
  summaryTextareaRef,
  queueSave,
  checkPermission
}, ref) {

  useImperativeHandle(ref, () => ({
    triggerSectionSave: () => {
      queueSave(`section_exit_${currentSection}`)
    }
  }), [currentSection, queueSave])

  const renderSectionContent = () => {
    switch (currentSection) {
      case 0: // About You
        return (
          <PersonalInfoSection
            formData={formData}
            updatePersonalField={updatePersonalField}
            setFormData={setFormData}
            checkPermission={checkPermission}
          />
        )

      case 1: // Summary
        return (
          <SummarySection
            formData={formData}
            updateSummary={updateSummary}
            summaryTextareaRef={summaryTextareaRef}
          />
        )

      case 2: // Experience
        return (
          <ExperienceSection
            experiences={formData.experience || []}
            onChange={(experiences) => {
              updateSection('experience', experiences)
              queueSave('experience')
            }}
          />
        )

      case 3: // Education
        return (
          <EducationSection
            education={formData.education || []}
            onChange={(education) => {
              updateSection('education', education)
              queueSave('education')
            }}
          />
        )

      case 4: // Skills & Languages (MERGED)
        return (
          <SkillsLanguagesSection
            skills={formData.skills || []}
            languages={formData.languages || []}
            onSkillsChange={(skills) => {
              updateSection('skills', skills)
              queueSave('skills')
            }}
            onLanguagesChange={(languages) => {
              updateSection('languages', languages)
              queueSave('languages')
            }}
            experience={formData.experience?.map(e => ({
              jobTitle: e.jobTitle,
              company: e.company
            }))}
          />
        )

      case 5: // Additional (Projects + Certifications MERGED)
        return (
          <AdditionalSection
            projects={formData.projects || []}
            certifications={formData.certifications || []}
            onProjectsChange={(projects) => {
              updateSection('projects', projects)
              queueSave('projects')
            }}
            onCertificationsChange={(certifications) => {
              updateSection('certifications', certifications)
              queueSave('certifications')
            }}
          />
        )

      default:
        return <div>Section not found</div>
    }
  }

  const isFirst = currentSection === 0
  const isLast = currentSection === TOTAL_SECTIONS - 1

  return (
    <div>
      {renderSectionContent()}

      {/* Section navigation */}
      <div className={`flex items-center mt-8 pt-6 border-t border-gray-200 ${isFirst ? 'justify-end' : 'justify-between'}`}>
        {!isFirst && (
          <button
            onClick={() => onSectionChange(currentSection - 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {SECTION_LABELS[currentSection - 1]}
          </button>
        )}
        {!isLast && (
          <button
            onClick={() => onSectionChange(currentSection + 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            {SECTION_LABELS[currentSection + 1]}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
})
