// PDF Generator - Server API only (no client-side template rendering for security)
import { ResumeData } from '../types/resume'
import { downloadBlob } from './browser-utils'

/**
 * Generate and download a PDF via server API
 * All PDF generation happens server-side to protect premium templates
 */
export const generateResumePDF = async (
  resumeData: ResumeData,
  fileName?: string,
  template: string = 'modern'
) => {
  try {
    const response = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        resumeData, 
        template, 
        action: 'download' 
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed' }))
      throw new Error(error.error || 'Failed to generate PDF')
    }

    const { pdf: base64Pdf, mimeType } = await response.json()
    
    // Convert base64 to blob
    const binaryString = atob(base64Pdf)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: mimeType })

    const defaultFileName = `${resumeData.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`
    const finalFileName = fileName || defaultFileName

    downloadBlob(blob, finalFileName)
    return true
  } catch (error) {
    console.error('[PDFGenerator] Failed to generate PDF:', error);
    throw new Error('Failed to generate PDF')
  }
}

/**
 * Get PDF blob via server API
 * Returns a blob that can be used for preview or download
 */
export const getResumePDFBlob = async (
  resumeData: ResumeData,
  template: string = 'modern',
  action: 'preview' | 'download' = 'preview'
): Promise<Blob> => {
  try {
    const response = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, template, action }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed' }))
      throw new Error(error.error || 'Failed to generate PDF')
    }

    const { pdf: base64Pdf, mimeType } = await response.json()
    
    // Convert base64 to blob
    const binaryString = atob(base64Pdf)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return new Blob([bytes], { type: mimeType })
  } catch (error) {
    console.error('[PDFGenerator] Failed to generate PDF blob:', error);
    throw new Error('Failed to generate PDF blob')
  }
}
