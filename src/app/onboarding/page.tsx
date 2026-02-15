'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { getAllTemplates } from '@/lib/templates'
import { Upload, FileText, PenLine, X, Check, LayoutTemplate } from 'lucide-react'
import toast from 'react-hot-toast'
import { QuickStartPicker } from '@/components/resume-builder/QuickStartPicker'
import { getQuickStartTemplate } from '@/lib/quick-start-templates'

// ── Progress Dots ──────────────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-8 bg-primary'
              : i + 1 < current
                ? 'w-2.5 bg-primary'
                : 'w-2.5 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// ── Main Onboarding Page ───────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()

  const [currentStep, setCurrentStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [uploadedData, setUploadedData] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [nameError, setNameError] = useState('')

  // Step transition animation
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Upload state
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Quick-start template state
  const [showQuickStart, setShowQuickStart] = useState(false)

  const nameInputRef = useRef<HTMLInputElement>(null)

  const templates = getAllTemplates()

  // ── Guard: redirect if already completed ──
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/user/onboarding-status')
        const data = await res.json()

        if (data.userNotFound) {
          // Webhook hasn't fired yet — wait and retry
          setTimeout(checkStatus, 2000)
          return
        }

        if (data.onboardingCompleted || data.resumeCount > 0) {
          router.replace('/dashboard')
          return
        }

        // Pre-fill name from API response
        if (data.userName && !fullName) {
          setFullName(data.userName)
        }
      } catch {
        // If status check fails, continue with onboarding
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pre-fill name from Clerk ──
  useEffect(() => {
    if (isLoaded && user && !fullName) {
      const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ')
      if (clerkName) setFullName(clerkName)
    }
  }, [isLoaded, user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-focus name input ──
  useEffect(() => {
    if (currentStep === 1 && nameInputRef.current && !isCheckingStatus) {
      nameInputRef.current.focus()
    }
  }, [currentStep, isCheckingStatus])

  // ── Step transition helper ──
  const goToStep = useCallback((step: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(step)
      setIsTransitioning(false)
    }, 150)
  }, [])

  // ── Handle quick-start template selection ──
  const handleQuickStartSelect = async (templateId: string) => {
    setShowQuickStart(false)
    const template = getQuickStartTemplate(templateId)
    if (!template) return
    // Merge user's name into the template data
    const formDataWithName = {
      ...template.data,
      personal: {
        ...template.data.personal,
        fullName: fullName.trim(),
      },
    }
    setUploadedData(formDataWithName)
    // Submit immediately with the template data
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/user/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          template: selectedTemplate,
          formData: formDataWithName,
        })
      })
      if (!res.ok) throw new Error('Failed to complete onboarding')
      const data = await res.json()
      router.push(`/resume-builder?id=${data.resumeId}`)
    } catch {
      toast.error(t('pages.onboarding.errors.createFailed'))
      setIsSubmitting(false)
    }
  }

  // ── Submit: complete onboarding ──
  const handleComplete = async (withUpload: boolean) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/user/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          template: selectedTemplate,
          ...(withUpload && uploadedData ? { formData: uploadedData } : {})
        })
      })

      if (!res.ok) {
        throw new Error('Failed to complete onboarding')
      }

      const data = await res.json()
      router.push(`/resume-builder?id=${data.resumeId}`)
    } catch {
      toast.error(t('pages.onboarding.errors.createFailed'))
      setIsSubmitting(false)
    }
  }

  // ── Skip onboarding ──
  const handleSkip = async () => {
    try {
      await fetch('/api/user/onboarding-skip', { method: 'POST' })
      router.replace('/dashboard')
    } catch {
      router.replace('/dashboard')
    }
  }

  // ── File upload handlers ──
  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setSelectedFile(file)
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Upload failed')

      setUploadedData(result.data)
      setUploadSuccess(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  // ── Loading state ──
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className={`w-full ${currentStep === 2 ? 'max-w-4xl' : 'max-w-lg'} transition-all duration-300`}>
          <ProgressDots current={currentStep} total={3} />

          <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* ── Step 1: Welcome + Name ── */}
            {currentStep === 1 && (
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {t('pages.onboarding.step1.title')}
                </h1>
                <p className="text-gray-600 mb-8">
                  {t('pages.onboarding.step1.subtitle')}
                </p>

                <div className="text-left mb-6">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pages.onboarding.step1.nameLabel')}
                  </label>
                  <input
                    ref={nameInputRef}
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (nameError) setNameError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && fullName.trim()) {
                        goToStep(2)
                      }
                    }}
                    placeholder={t('pages.onboarding.step1.namePlaceholder')}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                  {nameError && (
                    <p className="mt-2 text-sm text-red-600">{nameError}</p>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full sm:w-auto px-8 py-3 h-auto text-base"
                  onClick={() => {
                    if (!fullName.trim()) {
                      setNameError(t('pages.onboarding.errors.nameRequired'))
                      return
                    }
                    goToStep(2)
                  }}
                >
                  {t('pages.onboarding.step1.continue')}
                </Button>
              </div>
            )}

            {/* ── Step 2: Template Picker ── */}
            {currentStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {t('pages.onboarding.step2.title')}
                  </h1>
                  <p className="text-gray-600">
                    {t('pages.onboarding.step2.subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                  {templates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedTemplate === tmpl.id
                          ? 'ring-2 ring-primary ring-offset-2 shadow-md'
                          : 'border border-gray-200 hover:shadow-md hover:border-gray-300'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-full" style={{ aspectRatio: '210/297' }}>
                        <img
                          src={`/thumbnails/${tmpl.id}.svg`}
                          alt={tmpl.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Selected checkmark */}
                      {selectedTemplate === tmpl.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}

                      {/* Template name */}
                      <div className="p-2 text-center">
                        <p className={`text-xs sm:text-sm font-medium ${
                          selectedTemplate === tmpl.id ? 'text-primary' : 'text-gray-700'
                        }`}>
                          {tmpl.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => goToStep(1)}
                    className="px-6"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="px-8"
                    onClick={() => goToStep(3)}
                  >
                    {t('pages.onboarding.step2.continue')}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Upload or Start from Scratch ── */}
            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {t('pages.onboarding.step3.title')}
                  </h1>
                </div>

                {/* Upload success state */}
                {uploadSuccess ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-6">
                      {t('pages.onboarding.step3.uploadSuccess')}
                    </p>
                    <Button
                      type="button"
                      className="w-full sm:w-auto px-8 py-3 h-auto text-base"
                      onClick={() => handleComplete(true)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          {t('pages.onboarding.step3.creating')}
                        </>
                      ) : (
                        t('pages.onboarding.step3.createResume')
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Upload CV Card */}
                    <div
                      className={`relative rounded-xl border-2 p-6 transition-all cursor-pointer ${
                        selectedFile
                          ? 'border-primary bg-primary/5'
                          : isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        if (e.dataTransfer.files.length > 0) {
                          handleFileSelect(e.dataTransfer.files[0])
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Upload className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {t('pages.onboarding.step3.uploadCard.title')}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {t('pages.onboarding.step3.uploadCard.subtitle')}
                        </p>

                        {selectedFile ? (
                          <div className="border rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedFile(null)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isUploading}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {isUploading && (
                              <div className="mt-3">
                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                                  <span>Processing...</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <label htmlFor="cv-upload" className="cursor-pointer">
                            <input
                              id="cv-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.docx,.doc"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFileSelect(e.target.files[0])
                              }}
                            />
                            <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                              Browse files
                            </span>
                            <p className="text-xs text-gray-400 mt-2">PDF, DOCX (max 5MB)</p>
                          </label>
                        )}

                        {selectedFile && !isUploading && (
                          <Button
                            type="button"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpload()
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload & Extract
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Start from Template Card */}
                    <button
                      type="button"
                      onClick={() => setShowQuickStart(true)}
                      disabled={isSubmitting}
                      className="rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-purple-300 hover:shadow-sm text-center cursor-pointer disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <LayoutTemplate className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {t('pages.onboarding.step3.templateCard.title')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {t('pages.onboarding.step3.templateCard.subtitle')}
                      </p>
                      <span className="inline-flex items-center px-4 py-2 bg-purple-50 rounded-md text-sm font-medium text-purple-700">
                        <LayoutTemplate className="h-4 w-4 mr-2" />
                        {t('pages.onboarding.step3.templateCard.title')}
                      </span>
                    </button>

                    {/* Start from Scratch Card */}
                    <button
                      type="button"
                      onClick={() => handleComplete(false)}
                      disabled={isSubmitting}
                      className="rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-gray-300 hover:shadow-sm text-center cursor-pointer disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <PenLine className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {t('pages.onboarding.step3.scratchCard.title')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {t('pages.onboarding.step3.scratchCard.subtitle')}
                      </p>
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          {t('pages.onboarding.step3.creating')}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700">
                          <PenLine className="h-4 w-4 mr-2" />
                          {t('pages.onboarding.step3.scratchCard.title')}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Quick-start template picker modal */}
                  <QuickStartPicker
                    isOpen={showQuickStart}
                    onClose={() => setShowQuickStart(false)}
                    onSelect={handleQuickStartSelect}
                  />
                  </>
                )}

                {/* Back button */}
                {!uploadSuccess && !isSubmitting && (
                  <div className="flex justify-center mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => goToStep(2)}
                      className="px-6"
                    >
                      Back
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skip button */}
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              {t('pages.onboarding.skip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
