import { RefObject, forwardRef, useImperativeHandle } from 'react'
import { PersonalInfoSection } from './PersonalInfoSection'
import { SummarySection } from './SummarySection'
import { ExperienceSection } from '@/components/resume-builder/sections/ExperienceSection'
import { EducationSection } from '@/components/resume-builder/sections/EducationSection'
import { SkillsLanguagesSection } from '@/components/resume-builder/sections/SkillsLanguagesSection'
import { AdditionalSection } from '@/components/resume-builder/sections/AdditionalSection'
import { ResumeData } from '@/types/resume'
import { SubscriptionPermissions } from '@/types/subscription'

interface FormSectionRendererProps {
  currentSection: number
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

  return (
    <div>
      {renderSectionContent()}
    </div>
  )
})
