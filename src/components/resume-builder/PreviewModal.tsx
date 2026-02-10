'use client';
import React from 'react';
import { ResumeData } from '@/types/resume';
import { ResumePageScaler } from '@/components/html-templates/ResumePageScaler';
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useDownloadPDF } from '@/hooks/useDownloadPDF';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  template?: string;
}

export function PreviewModal({ isOpen, onClose, data, template = 'modern' }: PreviewModalProps) {
  const { availableTemplates } = useSubscription();
  const { downloadPDF, isDownloading } = useDownloadPDF();

  if (!isOpen) return null;

  const isRestricted = !availableTemplates.includes(template);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Resume Preview</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => downloadPDF(data, template)}
              disabled={isDownloading || isRestricted}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          <ResumePageScaler className="w-full">
            <TemplateRenderer
              templateId={template}
              data={data}
              watermark={isRestricted}
            />
          </ResumePageScaler>
        </div>
      </div>
    </div>
  );
}
