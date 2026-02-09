'use client'

import React, { useEffect, useState } from 'react'
import { Check, Lock, Eye } from 'lucide-react'
import { TemplateThumbnail } from './TemplateThumbnail'
import { getTierBadgeStyle } from '@/lib/templates'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface TemplateWithTier {
  id: string
  name: string
  description: string
  thumbnail: string
  category: 'professional' | 'creative' | 'minimal'
  tier: 'free' | 'basic' | 'pro'
}

interface TemplatesByTier {
  free: TemplateWithTier[]
  basic: TemplateWithTier[]
  pro: TemplateWithTier[]
}

interface TemplateGalleryProps {
  selectedTemplate: string
  onTemplateSelect: (templateId: string) => void
  onPreview?: (templateId: string) => void
  className?: string
  allowedTemplates?: string[]
}

export function TemplateGallery({ 
  selectedTemplate, 
  onTemplateSelect,
  onPreview,
  className = '',
  allowedTemplates 
}: TemplateGalleryProps) {
  const { t } = useLanguage()
  const { availableTemplates } = useSubscription()
  const [templatesByTier, setTemplatesByTier] = useState<TemplatesByTier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Use templates from subscription context or fallback to prop
  const userAllowedTemplates = allowedTemplates || availableTemplates

  // Fetch templates organized by tier
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplatesByTier(data)
        }
      } catch (error) {
        console.error('[TemplateGallery] Failed to fetch templates:', error);
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // Combine templates in tier order: free -> basic -> pro
  const orderedTemplates = templatesByTier 
    ? [...templatesByTier.free, ...templatesByTier.basic, ...templatesByTier.pro]
    : []
  return (
    <div className={`template-gallery ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('templateGallery.title')}</h3>
        <p className="text-sm text-gray-600">
          {t('templateGallery.description')}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-3 text-gray-600">{t('templateGallery.loading')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedTemplates.map((template) => {
          const isLocked = !userAllowedTemplates.includes(template.id)
          const isSelected = selectedTemplate === template.id
          
          return (
            <div
              key={template.id}
              className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : isLocked
                  ? 'border-gray-200 hover:border-orange-300 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onTemplateSelect(template.id)}
            >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            {/* Lock indicator for restricted templates */}
            {isLocked && (
              <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white rounded-full p-1">
                <Lock className="h-4 w-4" />
              </div>
            )}
            
            {/* Thumbnail with preview overlay */}
            <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden relative group/thumb">
              <TemplateThumbnail 
                templateId={template.id} 
                className="w-full h-full"
              />
              {/* Preview button overlay - appears on hover */}
              {onPreview && (
                <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview(template.id)
                    }}
                    className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors transform scale-90 group-hover/thumb:scale-100"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="font-medium text-sm">{t('templateGallery.preview')}</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Template info */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
              <p className="text-sm text-gray-600">{template.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  template.category === 'professional' 
                    ? 'bg-blue-100 text-blue-800'
                    : template.category === 'creative'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {t(`templateGallery.categories.${template.category}`)}
                </span>
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getTierBadgeStyle(template.tier).className}`}>
                  {t(`templateGallery.tiers.${template.tier}`)}
                </span>
              </div>
              {isLocked && (
                <p className="text-xs text-orange-600 mt-2">
                  {t('templateGallery.upgradeToAccess')}
                </p>
              )}
            </div>
            </div>
          )
          })}
        </div>
      )}
    </div>
  )
}