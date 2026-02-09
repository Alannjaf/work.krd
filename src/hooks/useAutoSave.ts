import { useState, useCallback } from 'react'
import { ResumeData } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'

interface UseAutoSaveProps {
  resumeId: string | null
  setResumeId: (id: string) => void
  formData: ResumeData
  selectedTemplate: string
  resumeTitle: string
}

export function useAutoSave({ 
  resumeId, 
  setResumeId, 
  formData, 
  selectedTemplate, 
  resumeTitle 
}: UseAutoSaveProps) {
  const { t } = useLanguage()
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedData, setLastSavedData] = useState<ResumeData | null>(null)
  const [saveQueue, setSaveQueue] = useState<NodeJS.Timeout | null>(null)

  // Quick save function with debouncing
  const quickSave = useCallback(async (changes: Record<string, unknown>, sectionType?: string) => {
    if (!resumeId) {
      // If no resume exists yet, create it first
      try {
        const response = await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: resumeTitle,
            template: selectedTemplate,
            formData
          })
        })

        if (!response.ok) {
          throw new Error(t('pages.resumeBuilder.errors.createFailed'))
        }

        const data = await response.json()
        setResumeId(data.resume.id)
        setLastSavedData({ ...formData })
        return true
      } catch (error) {
        console.error('[AutoSave] Failed to create resume:', error);
        return false
      }
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}/quick-save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          changes,
          currentSection: sectionType
        })
      })

      if (!response.ok) {
        throw new Error(t('pages.resumeBuilder.errors.saveFailed'))
      }

      // Update last saved data
      setLastSavedData({ ...formData })
      return true
    } catch (error) {
      console.error('[AutoSave] Failed to quick save:', error);
      return false
    }
  }, [resumeId, formData, selectedTemplate, resumeTitle, t, setResumeId])

  // Detect changes and queue save
  const queueSave = useCallback((sectionType?: string) => {
    // If no baseline data exists yet, initialize it
    if (!lastSavedData) {
      setLastSavedData({ ...formData })
      return
    }

    const changes: Record<string, unknown> = {}
    let hasChanges = false

    // Always include title in changes for save operations
    changes.title = resumeTitle

    if (JSON.stringify(formData.personal) !== JSON.stringify(lastSavedData.personal)) {
      changes.personal = formData.personal
      hasChanges = true
    }

    if (formData.summary !== lastSavedData.summary) {
      changes.summary = formData.summary
      hasChanges = true
    }

    // Check section-specific changes
    if (sectionType) {
      const currentSectionData = formData[sectionType as keyof ResumeData]
      const lastSectionData = lastSavedData[sectionType as keyof ResumeData]
      
      if (JSON.stringify(currentSectionData) !== JSON.stringify(lastSectionData)) {
        changes.sectionData = currentSectionData
        hasChanges = true
      }
    }

    if (hasChanges) {
      // Clear existing save queue
      if (saveQueue) {
        clearTimeout(saveQueue)
      }

      // Queue new save with debounce
      const timeoutId = setTimeout(() => {
        setIsAutoSaving(true)
        quickSave(changes, sectionType).finally(() => {
          setIsAutoSaving(false)
        })
      }, 500) // 500ms debounce

      setSaveQueue(timeoutId)
    }
  }, [lastSavedData, formData, resumeTitle, saveQueue, quickSave])

  return {
    isAutoSaving,
    queueSave,
    quickSave,
    lastSavedData,
    setLastSavedData
  }
}