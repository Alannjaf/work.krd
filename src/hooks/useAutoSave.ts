import { useState, useCallback, useRef, useEffect } from 'react'
import { ResumeData } from '@/types/resume'

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
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedData, setLastSavedData] = useState<ResumeData | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use refs to always have the latest values in the debounced callback
  const formDataRef = useRef(formData)
  const resumeIdRef = useRef(resumeId)
  const resumeTitleRef = useRef(resumeTitle)
  const selectedTemplateRef = useRef(selectedTemplate)

  useEffect(() => { formDataRef.current = formData }, [formData])
  useEffect(() => { resumeIdRef.current = resumeId }, [resumeId])
  useEffect(() => { resumeTitleRef.current = resumeTitle }, [resumeTitle])
  useEffect(() => { selectedTemplateRef.current = selectedTemplate }, [selectedTemplate])

  // Use ref for setResumeId to avoid stale closure in debounced callbacks
  const setResumeIdRef = useRef(setResumeId)
  useEffect(() => { setResumeIdRef.current = setResumeId }, [setResumeId])

  const performSave = useCallback(async () => {
    const currentFormData = formDataRef.current
    const currentResumeId = resumeIdRef.current
    const currentTitle = resumeTitleRef.current
    const currentTemplate = selectedTemplateRef.current

    if (!currentResumeId) {
      // Create new resume
      try {
        const response = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: currentTitle,
            template: currentTemplate,
            formData: currentFormData
          })
        })

        if (!response.ok) return false

        const data = await response.json()
        setResumeIdRef.current(data.resume.id)
        setLastSavedData({ ...currentFormData })
        return true
      } catch (error) {
        console.error('[AutoSave] Failed to create resume:', error)
        return false
      }
    }

    // Full save — always send complete formData to avoid partial saves
    try {
      const response = await fetch(`/api/resumes/${currentResumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          template: currentTemplate,
          formData: currentFormData
        })
      })

      if (!response.ok) return false

      setLastSavedData({ ...currentFormData })
      return true
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error)
      return false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uses refs for all dependencies to avoid stale closures
  }, [])

  // Queue a save with debouncing
  const queueSave = useCallback((_sectionType?: string) => {
    // Clear existing timer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Queue new save with 1s debounce
    saveTimeoutRef.current = setTimeout(() => {
      setIsAutoSaving(true)
      performSave().finally(() => {
        setIsAutoSaving(false)
      })
    }, 1000)
  }, [performSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    isAutoSaving,
    queueSave,
    quickSave: performSave,
    lastSavedData,
    setLastSavedData
  }
}
