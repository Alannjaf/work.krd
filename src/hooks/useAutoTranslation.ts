import { useState, useCallback } from 'react'
import { ResumeData } from '@/types/resume'
import { 
  isNonEnglishContent, 
  hasArabicIndicNumerals, 
  hasNonAsciiChars,
  normalizePhoneNumber,
  normalizeEmail,
  normalizeWebsite,
  normalizeLinkedIn
} from '@/lib/languageDetection'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

interface TranslationTask {
  content: string
  contentType: string
  contextInfo?: Record<string, string>
  updatePath: string[]
  index?: number
}

function buildTranslationTasks(formData: ResumeData): TranslationTask[] {
  const tasks: TranslationTask[] = []

  // Personal information
  if (formData.personal.fullName && isNonEnglishContent(formData.personal.fullName)) {
    tasks.push({ content: formData.personal.fullName, contentType: 'personal', updatePath: ['personal', 'fullName'] })
  }
  if (formData.personal.title && isNonEnglishContent(formData.personal.title)) {
    tasks.push({ content: formData.personal.title, contentType: 'personal', updatePath: ['personal', 'title'] })
  }
  if (formData.personal.location && isNonEnglishContent(formData.personal.location)) {
    tasks.push({ content: formData.personal.location, contentType: 'personal', updatePath: ['personal', 'location'] })
  }
  if (formData.personal.nationality && isNonEnglishContent(formData.personal.nationality)) {
    tasks.push({ content: formData.personal.nationality, contentType: 'personal', updatePath: ['personal', 'nationality'] })
  }
  if (formData.personal.country && isNonEnglishContent(formData.personal.country)) {
    tasks.push({ content: formData.personal.country, contentType: 'personal', updatePath: ['personal', 'country'] })
  }

  // Professional summary
  if (formData.summary && isNonEnglishContent(formData.summary)) {
    tasks.push({ content: formData.summary, contentType: 'summary', updatePath: ['summary'] })
  }

  // Work experience
  formData.experience.forEach((exp, i) => {
    if (exp.jobTitle && isNonEnglishContent(exp.jobTitle)) {
      tasks.push({ content: exp.jobTitle, contentType: 'personal', contextInfo: { company: exp.company }, updatePath: ['experience', 'jobTitle'], index: i })
    }
    if (exp.company && isNonEnglishContent(exp.company)) {
      tasks.push({ content: exp.company, contentType: 'personal', updatePath: ['experience', 'company'], index: i })
    }
    if (exp.location && isNonEnglishContent(exp.location)) {
      tasks.push({ content: exp.location, contentType: 'personal', updatePath: ['experience', 'location'], index: i })
    }
    if (exp.description && isNonEnglishContent(exp.description)) {
      tasks.push({ content: exp.description, contentType: 'description', contextInfo: { jobTitle: exp.jobTitle, company: exp.company }, updatePath: ['experience', 'description'], index: i })
    }
  })

  // Education
  formData.education.forEach((edu, i) => {
    if (edu.degree && isNonEnglishContent(edu.degree)) {
      tasks.push({ content: edu.degree, contentType: 'personal', updatePath: ['education', 'degree'], index: i })
    }
    if (edu.field && isNonEnglishContent(edu.field)) {
      tasks.push({ content: edu.field, contentType: 'personal', updatePath: ['education', 'field'], index: i })
    }
    if (edu.school && isNonEnglishContent(edu.school)) {
      tasks.push({ content: edu.school, contentType: 'personal', updatePath: ['education', 'school'], index: i })
    }
    if (edu.location && isNonEnglishContent(edu.location)) {
      tasks.push({ content: edu.location, contentType: 'personal', updatePath: ['education', 'location'], index: i })
    }
    if (edu.achievements && isNonEnglishContent(edu.achievements)) {
      tasks.push({ content: edu.achievements, contentType: 'description', updatePath: ['education', 'achievements'], index: i })
    }
  })

  // Skills
  formData.skills.forEach((skill, i) => {
    if (skill.name && isNonEnglishContent(skill.name)) {
      tasks.push({ content: skill.name, contentType: 'personal', updatePath: ['skills', 'name'], index: i })
    }
  })

  // Languages
  formData.languages.forEach((language, i) => {
    if (language.name && isNonEnglishContent(language.name)) {
      tasks.push({ content: language.name, contentType: 'personal', updatePath: ['languages', 'name'], index: i })
    }
  })

  // Projects
  if (formData.projects) {
    formData.projects.forEach((project, i) => {
      if (project.name && isNonEnglishContent(project.name)) {
        tasks.push({ content: project.name, contentType: 'personal', updatePath: ['projects', 'name'], index: i })
      }
      if (project.description && isNonEnglishContent(project.description)) {
        tasks.push({ content: project.description, contentType: 'project', contextInfo: { projectName: project.name }, updatePath: ['projects', 'description'], index: i })
      }
      if (project.technologies && isNonEnglishContent(project.technologies)) {
        tasks.push({ content: project.technologies, contentType: 'personal', updatePath: ['projects', 'technologies'], index: i })
      }
    })
  }

  // Certifications
  if (formData.certifications) {
    formData.certifications.forEach((cert, i) => {
      if (cert.name && isNonEnglishContent(cert.name)) {
        tasks.push({ content: cert.name, contentType: 'personal', updatePath: ['certifications', 'name'], index: i })
      }
      if (cert.issuer && isNonEnglishContent(cert.issuer)) {
        tasks.push({ content: cert.issuer, contentType: 'personal', updatePath: ['certifications', 'issuer'], index: i })
      }
    })
  }

  return tasks
}

export function useAutoTranslation() {
  const { t } = useLanguage()
  const [isAutoTranslating, setIsAutoTranslating] = useState(false)

  // Quick check if form data contains any non-English content or needs normalization
  const hasNonEnglishContent = useCallback((formData: ResumeData): boolean => {
    // Personal information - text fields
    if (formData.personal.fullName && isNonEnglishContent(formData.personal.fullName)) return true
    if (formData.personal.title && isNonEnglishContent(formData.personal.title)) return true
    if (formData.personal.location && isNonEnglishContent(formData.personal.location)) return true
    if (formData.personal.nationality && isNonEnglishContent(formData.personal.nationality)) return true
    if (formData.personal.country && isNonEnglishContent(formData.personal.country)) return true
    
    // Phone number - check for Arabic-Indic numerals
    if (formData.personal.phone && hasArabicIndicNumerals(formData.personal.phone)) return true
    
    // Email, website, linkedin - check for non-ASCII characters
    if (formData.personal.email && hasNonAsciiChars(formData.personal.email)) return true
    if (formData.personal.website && hasNonAsciiChars(formData.personal.website)) return true
    if (formData.personal.linkedin && hasNonAsciiChars(formData.personal.linkedin)) return true

    // Professional summary
    if (formData.summary && isNonEnglishContent(formData.summary)) return true

    // Work experience
    for (const exp of formData.experience) {
      if (exp.jobTitle && isNonEnglishContent(exp.jobTitle)) return true
      if (exp.company && isNonEnglishContent(exp.company)) return true
      if (exp.location && isNonEnglishContent(exp.location)) return true
      if (exp.description && isNonEnglishContent(exp.description)) return true
    }

    // Education
    for (const edu of formData.education) {
      if (edu.degree && isNonEnglishContent(edu.degree)) return true
      if (edu.field && isNonEnglishContent(edu.field)) return true
      if (edu.school && isNonEnglishContent(edu.school)) return true
      if (edu.location && isNonEnglishContent(edu.location)) return true
      if (edu.achievements && isNonEnglishContent(edu.achievements)) return true
    }

    // Skills
    for (const skill of formData.skills) {
      if (skill.name && isNonEnglishContent(skill.name)) return true
    }

    // Languages
    for (const language of formData.languages) {
      if (language.name && isNonEnglishContent(language.name)) return true
    }

    // Projects
    if (formData.projects) {
      for (const project of formData.projects) {
        if (project.name && isNonEnglishContent(project.name)) return true
        if (project.description && isNonEnglishContent(project.description)) return true
        if (project.technologies && isNonEnglishContent(project.technologies)) return true
      }
    }

    // Certifications
    if (formData.certifications) {
      for (const cert of formData.certifications) {
        if (cert.name && isNonEnglishContent(cert.name)) return true
        if (cert.issuer && isNonEnglishContent(cert.issuer)) return true
      }
    }

    return false
  }, [])

  const autoTranslateToEnglish = useCallback(async (formData: ResumeData): Promise<ResumeData> => {
    const translatedData = { ...formData }
    // Deep clone personal to avoid mutation issues
    translatedData.personal = { ...formData.personal }
    let hasTranslations = false

    // First, normalize phone number if it contains Arabic-Indic numerals
    // This is done locally without AI, just numeral conversion
    if (formData.personal.phone && hasArabicIndicNumerals(formData.personal.phone)) {
      translatedData.personal.phone = normalizePhoneNumber(formData.personal.phone)
      hasTranslations = true
    }

    // Normalize email if it contains non-ASCII characters
    // Emails must be ASCII-only to be valid
    if (formData.personal.email && hasNonAsciiChars(formData.personal.email)) {
      translatedData.personal.email = normalizeEmail(formData.personal.email)
      hasTranslations = true
    }

    // Normalize website if it contains non-ASCII characters
    // URLs should be ASCII-only
    if (formData.personal.website && hasNonAsciiChars(formData.personal.website)) {
      translatedData.personal.website = normalizeWebsite(formData.personal.website)
      hasTranslations = true
    }

    // Normalize LinkedIn if it contains non-ASCII characters
    if (formData.personal.linkedin && hasNonAsciiChars(formData.personal.linkedin)) {
      translatedData.personal.linkedin = normalizeLinkedIn(formData.personal.linkedin)
      hasTranslations = true
    }

    try {
      const translationTasks = buildTranslationTasks(formData)

      // If no translation tasks, return original data
      if (translationTasks.length === 0) {
        return translatedData
      }

      // Single bulk API call for all translations
      const response = await fetch('/api/ai/translate-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: translationTasks.map(task => ({
            content: task.content,
            contentType: task.contentType,
            contextInfo: task.contextInfo,
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Bulk translation failed')
      }

      const { translations } = await response.json()

      // Map results back to translatedData
      translations.forEach((translation: { enhancedContent: string; detectedLanguage: string }, i: number) => {
        const task = translationTasks[i]
        if (!translation.enhancedContent) return

        if (task.index !== undefined) {
          const section = translatedData[task.updatePath[0] as keyof ResumeData] as unknown as Array<Record<string, unknown>>
          if (section[task.index]) {
            section[task.index][task.updatePath[1]] = translation.enhancedContent
            hasTranslations = true
          }
        } else if (task.updatePath.length === 2) {
          const section = translatedData[task.updatePath[0] as keyof ResumeData] as unknown as Record<string, unknown>
          section[task.updatePath[1]] = translation.enhancedContent
          hasTranslations = true
        } else if (task.updatePath.length === 1) {
          (translatedData as Record<string, unknown>)[task.updatePath[0]] = translation.enhancedContent
          hasTranslations = true
        }
      })

      if (hasTranslations) {
        toast.success(t('pages.resumeBuilder.autoTranslate.success'))
      }

      return translatedData
    } catch (error) {
      console.error('[AutoTranslation] Failed to auto-translate:', error);
      toast.error(t('pages.resumeBuilder.autoTranslate.error'))
      return formData
    }
  }, [t])

  return {
    isAutoTranslating,
    setIsAutoTranslating,
    autoTranslateToEnglish,
    hasNonEnglishContent
  }
}