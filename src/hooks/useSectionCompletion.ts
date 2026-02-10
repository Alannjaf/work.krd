import { useMemo } from 'react'
import { ResumeData } from '@/types/resume'

export function useSectionCompletion(formData: ResumeData): Record<number, number> {
  return useMemo(() => {
    const completion: Record<number, number> = {}

    // Section 0: About You
    const personalFields = ['fullName', 'email', 'phone', 'title'] as const
    const personalFilled = personalFields.filter(f => {
      const val = formData.personal[f]
      return val && val.trim() !== ''
    }).length
    completion[0] = Math.round((personalFilled / personalFields.length) * 100)

    // Section 1: Summary
    completion[1] = formData.summary && formData.summary.trim().length > 10 ? 100 : 0

    // Section 2: Experience
    completion[2] = formData.experience && formData.experience.length > 0
      ? formData.experience.some(e => e.jobTitle && e.company) ? 100 : 50
      : 0

    // Section 3: Education
    completion[3] = formData.education && formData.education.length > 0
      ? formData.education.some(e => e.degree && e.school) ? 100 : 50
      : 0

    // Section 4: Skills & Languages
    const hasSkills = formData.skills && formData.skills.length > 0
    const hasLanguages = formData.languages && formData.languages.length > 0
    if (hasSkills && hasLanguages) completion[4] = 100
    else if (hasSkills || hasLanguages) completion[4] = 50
    else completion[4] = 0

    // Section 5: Additional (Projects + Certifications)
    const hasProjects = formData.projects && formData.projects.length > 0
    const hasCerts = formData.certifications && formData.certifications.length > 0
    if (hasProjects || hasCerts) completion[5] = 100
    else completion[5] = 0

    return completion
  }, [formData])
}
