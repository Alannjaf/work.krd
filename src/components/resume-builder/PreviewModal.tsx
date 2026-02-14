'use client';

import React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/types/resume';
import { ResumePageScaler } from '@/components/html-templates/ResumePageScaler';
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer';
import { useDownloadPDF } from '@/hooks/useDownloadPDF';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  template: string;
}

export function PreviewModal({ isOpen, onClose, data, template }: PreviewModalProps) {
  const { downloadPDF, isDownloading } = useDownloadPDF();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-medium text-gray-600">Preview</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => downloadPDF(data, template)}
              disabled={isDownloading}
              className="h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {isDownloading ? 'Downloading...' : 'PDF'}
            </Button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <ResumePageScaler className="w-full">
            <TemplateRenderer templateId={template} data={data} />
          </ResumePageScaler>
        </div>
      </div>
    </div>
  );
}
