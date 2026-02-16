'use client'

import React from 'react'
import { ResumeData } from '@/types/resume'
import { ResumePageScaler } from '@/components/html-templates/ResumePageScaler'
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer'
import { TemplateSwitcher } from './TemplateSwitcher'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useDownloadPDF } from '@/hooks/useDownloadPDF'
import { useLanguage } from '@/contexts/LanguageContext'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LivePreviewPanelProps {
  data: ResumeData
  templateId: string
  onTemplateChange: (templateId: string) => void
}

export function LivePreviewPanel({ data, templateId, onTemplateChange }: LivePreviewPanelProps) {
  const { availableTemplates } = useSubscription()
  const { downloadPDF, isDownloading } = useDownloadPDF()
  const { t } = useLanguage()
  const isRestricted = !availableTemplates.includes(templateId)

  return (
    <div className="flex flex-col h-full relative">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50/80">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => downloadPDF(data, templateId)}
          disabled={isDownloading || isRestricted}
          className="h-7 text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          {isDownloading ? t('common.downloading') : 'PDF'}
        </Button>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <ResumePageScaler className="w-full">
          <TemplateRenderer
            templateId={templateId}
            data={data}
            watermark={isRestricted}
          />
        </ResumePageScaler>
      </div>

      {/* Floating template switcher */}
      <TemplateSwitcher
        selectedTemplate={templateId}
        onTemplateChange={onTemplateChange}
      />
    </div>
  )
}
