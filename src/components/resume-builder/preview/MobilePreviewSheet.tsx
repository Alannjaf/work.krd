'use client'

import React, { useState } from 'react'
import { ResumeData } from '@/types/resume'
import { ResumePageScaler } from '@/components/html-templates/ResumePageScaler'
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer'
import { templateRegistry } from '@/components/html-templates/registry'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useDownloadPDF } from '@/hooks/useDownloadPDF'
import { Eye, X, Download, Check, Lock, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobilePreviewSheetProps {
  data: ResumeData
  templateId: string
  onTemplateChange: (templateId: string) => void
}

export function MobilePreviewSheet({ data, templateId, onTemplateChange }: MobilePreviewSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { availableTemplates } = useSubscription()
  const { downloadPDF, isDownloading } = useDownloadPDF()
  const isRestricted = !availableTemplates.includes(templateId)

  const templates = Object.values(templateRegistry)

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-30 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="Preview resume"
      >
        <Eye className="h-5 w-5" />
      </button>

      {/* Full-screen bottom sheet */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 top-10 bg-white rounded-t-2xl overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2 border-b">
              <span className="text-sm font-semibold">Preview</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => downloadPDF(data, templateId)}
                  disabled={isDownloading || isRestricted}
                  className="h-8"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {isDownloading ? '...' : 'PDF'}
                </Button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Template row */}
            <div className="px-4 py-2 border-b bg-gray-50 overflow-x-auto">
              <div className="flex gap-2">
                {templates.map(template => {
                  const isActive = template.id === templateId
                  const isLocked = !availableTemplates.includes(template.id)
                  return (
                    <button
                      key={template.id}
                      onClick={() => onTemplateChange(template.id)}
                      className={`relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="h-3 w-3" />
                      ) : isActive ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Palette className="h-3 w-3" />
                      )}
                      {template.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Scrollable preview */}
            <div className="flex-1 overflow-auto bg-gray-200 p-4">
              <ResumePageScaler className="w-full">
                <TemplateRenderer
                  templateId={templateId}
                  data={data}
                  watermark={isRestricted}
                />
              </ResumePageScaler>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
