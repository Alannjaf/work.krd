'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AppHeader } from '@/components/shared/AppHeader'
import { CheckCircle, Edit, ArrowLeft, Crown } from 'lucide-react'
import { ResumeUploader } from '@/components/resume-builder/ResumeUploader'
import { ResumeData } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

// Type guard to validate ResumeData structure
function isValidResumeData(data: unknown): data is ResumeData {
  if (!data || typeof data !== 'object') return false
  
  const resumeData = data as Record<string, unknown>
  
  // Check for required personal info structure
  const personal = resumeData.personal
  if (!personal || typeof personal !== 'object') return false
  
  const personalData = personal as Record<string, unknown>
  
  // Check for basic required fields
  return (
    typeof personalData.fullName === 'string' &&
    typeof personalData.email === 'string' &&
    typeof personalData.phone === 'string' &&
    typeof personalData.location === 'string' &&
    typeof personalData.linkedin === 'string' &&
    typeof personalData.website === 'string' &&
    typeof resumeData.summary === 'string' &&
    Array.isArray(resumeData.experience) &&
    Array.isArray(resumeData.education) &&
    Array.isArray(resumeData.skills) &&
    Array.isArray(resumeData.languages)
  )
}

export default function ImportResumePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'edit'>('upload')
  const [extractedData, setExtractedData] = useState<ResumeData | null>(null)
  const [resumeTitle, setResumeTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [canImport, setCanImport] = useState<boolean | null>(null)

  // Initialize default title when translations are ready
  useEffect(() => {
    if (!resumeTitle && t) {
      setResumeTitle(t('import.review.defaultTitle'))
    }
  }, [t, resumeTitle])

  useEffect(() => {
    // Check if user can import
    const checkImportAccess = async () => {
      try {
        const permissionsResponse = await fetch('/api/user/permissions')
        const permissionsData = await permissionsResponse.json()
        setCanImport(permissionsData.canImport)
      } catch (error) {
        console.error('[ImportResume] Failed to check import access:', error);
        setCanImport(false)
      }
    }
    
    checkImportAccess()
  }, [])

  const handleUploadComplete = (data: unknown) => {
    // Type guard to ensure the data matches ResumeData structure
    if (isValidResumeData(data)) {
      setExtractedData(data)
      setCurrentStep('review')
    } else {
      toast.error(t('import.messages.invalidData'))
      return
    }
    
    // Set title based on extracted name (data is now guaranteed to be ResumeData)
    if (data.personal?.fullName) {
      setResumeTitle(`${data.personal.fullName}'s Resume`)
    } else {
      setResumeTitle(t('import.review.defaultTitle'))
    }
  }

  const handleSave = async () => {
    if (!extractedData) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'},
        body: JSON.stringify({
          title: resumeTitle,
          template: 'modern',
          formData: extractedData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save resume')
      }

      const result = await response.json()
      toast.success(t('import.messages.importSuccess'))
      
      // Redirect to edit the new resume
      router.push(`/resume-builder?id=${result.resume.id}`)
    } catch (error) {
      console.error('[ImportResume] Failed to save imported resume:', error);
      toast.error(t('import.messages.importError'))
    } finally {
      setIsSaving(false)
    }
  }

  const renderUploadStep = () => {
    if (canImport === null) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )
    }

    if (!canImport) {
      return (
        <Card className="p-8 text-center">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{t('import.proFeature.title')}</h2>
          <p className="text-gray-600 mb-6">
            {t('import.proFeature.description')}
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/billing')}>
              <Crown className="h-4 w-4 mr-2" />
              {t('import.proFeature.upgradeButton')}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              {t('import.actions.backToDashboard')}
            </Button>
          </div>
        </Card>
      )
    }

    return (
      <ResumeUploader
        onUploadComplete={handleUploadComplete}
        onCancel={() => router.push('/dashboard')}
      />
    )
  }

  const renderReviewStep = () => {
    if (!extractedData) return null

    return (
      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{t('import.review.title')}</h2>
          <p className="text-gray-600">
            {t('import.review.description')}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t('import.review.resumeTitle')}</label>
          <input
            type="text"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-6 mb-8">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              {t('import.review.sections.personalInfo')}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-gray-600">{t('import.review.fields.name')}:</span>
                <p className="font-medium">{extractedData.personal.fullName || t('import.review.notFound')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('import.review.fields.email')}:</span>
                <p className="font-medium">{extractedData.personal.email || t('import.review.notFound')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('import.review.fields.phone')}:</span>
                <p className="font-medium">{extractedData.personal.phone || t('import.review.notFound')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('import.review.fields.location')}:</span>
                <p className="font-medium">{extractedData.personal.location || t('import.review.notFound')}</p>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          {extractedData.summary && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {t('import.review.sections.summary')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{extractedData.summary}</p>
              </div>
            </div>
          )}

          {/* Work Experience */}
          {extractedData.experience.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {t('import.review.sections.experience')} ({extractedData.experience.length} {t('import.review.positions')})
              </h3>
              <div className="space-y-3">
                {extractedData.experience.slice(0, 2).map((exp, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{exp.jobTitle}</p>
                    <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.current ? t('import.review.present') : exp.endDate}</p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                ))}
                {extractedData.experience.length > 2 && (
                  <p className="text-sm text-gray-500 italic">
                    {t('import.review.morePositions').replace('{count}', (extractedData.experience.length - 2).toString())}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {extractedData.education.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {t('import.review.sections.education')} ({extractedData.education.length} {t('import.review.entries')})
              </h3>
              <div className="space-y-3">
                {extractedData.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{edu.degree} in {edu.field}</p>
                    <p className="text-sm text-gray-600">{edu.school}</p>
                    <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {extractedData.skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {t('import.review.sections.skills')} ({extractedData.skills.length} {t('import.review.skills')})
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {extractedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white rounded-full text-sm border"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Languages */}
          {extractedData.languages.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {t('import.review.sections.languages')} ({extractedData.languages.length} {t('import.review.languages')})
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {extractedData.languages.map((language, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{language.name}</span>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        {language.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('upload')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('import.actions.back')}
          </Button>
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                if (extractedData) {
                  // Save to session storage and go to resume builder
                  sessionStorage.setItem('importedResumeData', JSON.stringify(extractedData))
                  sessionStorage.setItem('importedResumeTitle', resumeTitle)
                  router.push('/resume-builder')
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('import.actions.editBeforeSaving')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  {t('import.actions.saving')}
                </>
              ) : (
                t('import.actions.saveResume')
              )}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        title={t('import.title')}
        showBackButton={true}
        backButtonText={t('import.actions.backToDashboard')}
        backButtonHref="/dashboard"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'review' && renderReviewStep()}
      </main>
    </div>
  )
}