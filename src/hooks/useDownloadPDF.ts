'use client';
import { useState, useCallback } from 'react';
import { ResumeData } from '@/types/resume';
import { downloadBlob } from '@/lib/browser-utils';
import toast from 'react-hot-toast';

export function useDownloadPDF() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = useCallback(async (data: ResumeData, template: string) => {
    if (!data.personal.fullName) {
      toast.error('Please fill in your name first');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: data, template, action: 'download' }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed' }));
        if (response.status === 403) {
          toast.error(error.error || 'Export limit reached');
          window.open('/billing', '_blank');
          return;
        }
        throw new Error(error.error || 'Failed to download');
      }

      const blob = await response.blob();
      downloadBlob(blob, `${data.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('[useDownloadPDF] Failed:', error);
      toast.error('Failed to download resume');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadPDF, isDownloading };
}
