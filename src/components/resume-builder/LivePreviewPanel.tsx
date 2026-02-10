'use client';
import React from 'react';
import { ResumeData } from '@/types/resume';
import { ResumePageScaler } from '@/components/html-templates/ResumePageScaler';
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useDownloadPDF } from '@/hooks/useDownloadPDF';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivePreviewPanelProps {
  data: ResumeData;
  templateId: string;
}

export function LivePreviewPanel({ data, templateId }: LivePreviewPanelProps) {
  const { availableTemplates } = useSubscription();
  const { downloadPDF, isDownloading } = useDownloadPDF();
  const isRestricted = !availableTemplates.includes(templateId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <span className="text-sm font-medium text-gray-600">Live Preview</span>
        <Button
          size="sm"
          onClick={() => downloadPDF(data, templateId)}
          disabled={isDownloading || isRestricted}
          className="h-8"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
      </div>
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
  );
}
