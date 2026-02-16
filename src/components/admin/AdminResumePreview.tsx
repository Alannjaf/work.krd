'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, FileText, RotateCcw } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { ResumePreview } from '@/components/resume-builder/ResumePreview';
import { toast } from 'react-hot-toast';
import { useCsrfToken } from '@/hooks/useCsrfToken';

interface AdminResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  template: string;
  resumeTitle: string;
}

export function AdminResumePreview({ 
  isOpen, 
  onClose, 
  data, 
  template, 
  resumeTitle 
}: AdminResumePreviewProps) {
  const { csrfFetch } = useCsrfToken();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'pdf' | 'html'>('pdf'); // Start with PDF by default
  const pdfUrlRef = useRef<string | null>(null);

  const generatePDF = async () => {
    if (!data.personal.fullName && !data.personal.email) {
      toast.error('Resume appears to be empty');
      return;
    }

    setLoading(true);
    try {
      // Clean up previous URL
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }

      // Use admin-specific server-side PDF generation (no watermarks)
      const response = await csrfFetch('/api/admin/preview-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: data,
          template: template,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      pdfUrlRef.current = url;
      setPdfUrl(url);
    } catch (error) {
      console.error('[AdminResumePreview] Failed to generate PDF preview:', error);
      toast.error('Failed to generate PDF preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('[AdminResumePreview] Failed to download resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  useEffect(() => {
    if (isOpen && viewMode === 'pdf') {
      generatePDF();
    }
  }, [isOpen, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Resume Preview</h2>
            <p className="text-sm text-gray-600">{resumeTitle} - {template} template</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 px-3 py-1 bg-white border rounded-lg">
              <button
                onClick={() => setViewMode('html')}
                className={`px-2 py-1 rounded text-sm ${
                  viewMode === 'html' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-1" />
                HTML
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2 py-1 rounded text-sm ${
                  viewMode === 'pdf' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                PDF
              </button>
            </div>

            {/* Zoom Controls */}
            {!loading && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white border rounded-lg">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={zoom <= 0.5}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={zoom >= 3}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 hover:bg-gray-100 rounded ml-1"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Download Button */}
            {viewMode === 'pdf' && pdfUrl && !loading && (
              <button
                onClick={handleDownload}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}
            
            {/* Generate PDF Button for HTML mode */}
            {viewMode === 'html' && (
              <button
                onClick={() => setViewMode('pdf')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Generate PDF
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {viewMode === 'html' ? (
            <div className="flex justify-center">
              <div 
                className="mx-auto bg-white shadow-lg"
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                  width: '210mm',
                  minHeight: '297mm'
                }}
              >
                <ResumePreview data={data} template={template} />
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Generating PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="w-full">
              <div 
                className="mx-auto bg-white shadow-lg"
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                  width: '210mm',
                  minHeight: '297mm'
                }}
              >
                <iframe
                  src={`${pdfUrl}#view=FitV&toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full border-0"
                  style={{ 
                    height: '800px', // Fixed height to ensure content is visible
                    minHeight: '800px'
                  }}
                  title="Resume Preview"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Failed to generate PDF preview. The resume data might be incomplete.
                </p>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}