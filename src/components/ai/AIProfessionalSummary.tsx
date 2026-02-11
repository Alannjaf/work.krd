'use client'

import { useState } from 'react'
import { AISuggestionButton } from './AISuggestionButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

interface AIProfessionalSummaryProps {
  currentSummary: string
  onAccept: (summary: string) => void
  onActionComplete?: () => void
  experience?: Array<{
    jobTitle: string
    company: string
  }>
  skills?: Array<{
    name: string
  }>
}

export function AIProfessionalSummary({ 
  onAccept, 
  onActionComplete,
  experience = [],
  skills = []
}: AIProfessionalSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { t } = useLanguage()
  const [generatedSummary, setGeneratedSummary] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: experience[0]?.jobTitle || '',
    industry: '',
    experienceLevel: ''
  })

  const generateSummary = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          industry: formData.industry,
          experience: formData.experienceLevel,
          skills: skills.map(s => s.name),
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t('ai.error'))
      }

      const data = await response.json()
      setGeneratedSummary(data.summary)
      setShowSuggestion(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('ai.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = () => {
    onAccept(generatedSummary)
    setShowSuggestion(false)
    setGeneratedSummary('')
    onActionComplete?.()
  }

  const handleReject = () => {
    setShowSuggestion(false)
    setGeneratedSummary('')
    onActionComplete?.()
  }

  const handleRegenerate = () => {
    setShowSuggestion(false)
    setGeneratedSummary('')
    generateSummary()
  }

  if (showSuggestion && generatedSummary) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 overflow-hidden">
          <div className="flex items-start space-x-2 mb-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-purple-900 mb-2">{t('ai.generatedSummary') || 'AI-Generated Professional Summary'}</h4>
              <p className="text-gray-700 leading-relaxed">{generatedSummary}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-1" />
              {t('ai.useThis') || 'Use This'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleRegenerate}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('ai.regenerate') || 'Regenerate'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleReject}>
              <X className="h-4 w-4 mr-1" />
              {t('ai.dismiss') || 'Dismiss'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 shadow-md">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg font-bold">AI</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">{t('ai.generateSummaryTitle') || 'Generate Professional Summary with AI'}</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('ai.targetJobTitle') || 'Target Job Title'}
            </label>
            <Input
              placeholder={t('ai.jobTitlePlaceholder') || 'e.g. Software Engineer'}
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('ai.industry') || 'Industry'}
            </label>
            <Input
              placeholder={t('ai.industryPlaceholder') || 'e.g. Technology'}
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('ai.experienceLevel') || 'Experience Level'}
            </label>
            <Input
              placeholder={t('ai.experiencePlaceholder') || 'e.g. 3 years'}
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            />
          </div>
        </div>
        
        <AISuggestionButton
          onClick={generateSummary}
          disabled={!formData.jobTitle || isGenerating}
          className="w-full"
          size="lg"
        >
          {t('ai.generateSummary') || 'Generate Summary with AI'}
        </AISuggestionButton>
        
        <p className="text-sm text-gray-600 mt-3 text-center">
          {t('ai.summaryDescription') || 'Our AI will create a tailored professional summary based on your information'}
        </p>
      </div>
    </div>
  )
}