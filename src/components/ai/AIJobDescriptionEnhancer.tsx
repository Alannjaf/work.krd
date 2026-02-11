'use client'

import { useState } from 'react'
import { AISuggestionButton } from './AISuggestionButton'
import { Button } from '@/components/ui/button'
import { Check, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

interface AIJobDescriptionEnhancerProps {
  currentDescription: string
  jobTitle: string
  onAccept: (description: string) => void
  onActionComplete?: () => void
}

export function AIJobDescriptionEnhancer({ 
  currentDescription = '', 
  jobTitle = '',
  onAccept,
  onActionComplete
}: AIJobDescriptionEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const { t } = useLanguage()
  const [enhancedDescription, setEnhancedDescription] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)

  const enhanceDescription = async () => {
    if ((!currentDescription || !currentDescription.trim()) && (!jobTitle || !jobTitle.trim())) {
      toast.error(t('ai.enterDescriptionFirst') || 'Please enter a job description or job title first')
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/ai/enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: currentDescription,
          jobTitle: jobTitle,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t('ai.error'))
      }

      const data = await response.json()
      setEnhancedDescription(data.enhancedDescription)
      setShowSuggestion(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('ai.error'))
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleAccept = () => {
    // Convert bullet points to HTML list format for the rich text editor
    const formatDescription = (text: string): string => {
      const lines = text.split('\n').filter(line => line.trim())
      const bulletLines: string[] = []
      const regularLines: string[] = []
      
      lines.forEach(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('• ')) {
          bulletLines.push(trimmed.substring(2)) // Remove the bullet and space
        } else if (trimmed.startsWith('•')) {
          bulletLines.push(trimmed.substring(1)) // Remove just the bullet
        } else {
          // If we have bullet points collected, add them as a list
          if (bulletLines.length > 0) {
            const listItems = bulletLines.map(item => `<li>${item}</li>`).join('')
            regularLines.push(`<ul>${listItems}</ul>`)
            bulletLines.length = 0 // Clear the array
          }
          if (trimmed) {
            regularLines.push(`<p>${trimmed}</p>`)
          }
        }
      })
      
      // Handle any remaining bullet points
      if (bulletLines.length > 0) {
        const listItems = bulletLines.map(item => `<li>${item}</li>`).join('')
        regularLines.push(`<ul>${listItems}</ul>`)
      }
      
      return regularLines.join('')
    }

    const formattedDescription = formatDescription(enhancedDescription)
    onAccept(formattedDescription)
    setShowSuggestion(false)
    setEnhancedDescription('')
    onActionComplete?.()
  }

  const handleReject = () => {
    setShowSuggestion(false)
    setEnhancedDescription('')
    onActionComplete?.()
  }

  const handleRegenerate = () => {
    setShowSuggestion(false)
    setEnhancedDescription('')
    enhanceDescription()
  }

  if (showSuggestion && enhancedDescription) {
    return (
      <div className="mt-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 overflow-hidden">
          <div className="flex items-start space-x-2 mb-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-purple-900 mb-2">{t('ai.enhancedDescription') || 'AI-Enhanced Job Description'}</h4>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{enhancedDescription}</div>
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
    <div className="mt-2">
      <AISuggestionButton
        onClick={enhanceDescription}
        disabled={(!currentDescription || !currentDescription.trim()) && (!jobTitle || !jobTitle.trim()) || isEnhancing}
        size="sm"
      >
        {t('ai.enhanceButton')}
      </AISuggestionButton>
    </div>
  )
}