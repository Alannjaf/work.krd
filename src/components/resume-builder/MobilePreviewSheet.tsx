'use client';
import React, { useState } from 'react';
import { ResumeData } from '@/types/resume';
import { ResumePageScaler } from '@/components/html-templates/ResumePageScaler';
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useDownloadPDF } from '@/hooks/useDownloadPDF';
import { Eye, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobilePreviewSheetProps {
  data: ResumeData;
  templateId: string;
}

export function MobilePreviewSheet({ data, templateId }: MobilePreviewSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { availableTemplates } = useSubscription();
  const { downloadPDF, isDownloading } = useDownloadPDF();
  const isRestricted = !availableTemplates.includes(templateId);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="Preview resume"
      >
        <Eye className="h-6 w-6" />
      </button>

      {/* Full-screen bottom sheet */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 top-12 bg-white rounded-t-2xl overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b">
              <span className="text-sm font-semibold">Resume Preview</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => downloadPDF(data, templateId)}
                  disabled={isDownloading || isRestricted}
                  className="h-8"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
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
  );
}
