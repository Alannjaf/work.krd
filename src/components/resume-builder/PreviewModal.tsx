'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ResumeData } from '@/types/resume'
import { useSubscription } from '@/contexts/SubscriptionContext'
import toast from 'react-hot-toast'

import { shouldUsePDFJS } from '@/utils/browserDetection'
import { detectBrowser, downloadBlob } from '@/lib/browser-utils'
import { PreviewModalHeader } from './PreviewModalHeader'
import { PreviewModalContent } from './PreviewModalContent'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  data: ResumeData
  template?: string
}

export function PreviewModal({ isOpen, onClose, data, template = 'modern' }: PreviewModalProps) {
  const { availableTemplates } = useSubscription()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null)
  const [usePDFJS, setUsePDFJS] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentPdfPage, setCurrentPdfPage] = useState(1)
  const [totalPdfPages, setTotalPdfPages] = useState(1)
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null)
  const [templateAccess, setTemplateAccess] = useState<string>('granted')
  const currentPdfUrlRef = useRef<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    setUsePDFJS(shouldUsePDFJS())
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getPDFPageCount = async (blob: Blob): Promise<number> => {
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const { PDFDocument } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      return pdfDoc.getPageCount()
    } catch (error) {
      console.error('[PreviewModal] Failed to get PDF page count:', error);
      return 1
    }
  }

  const updatePdfUrl = useCallback((baseUrl: string, page: number) => {
    const browser = detectBrowser()
    let urlWithPage: string

    if (baseUrl.startsWith('blob:')) {
      urlWithPage = baseUrl
    } else {
      switch (browser) {
        case 'edge':
          urlWithPage = `${baseUrl}#toolbar=0&navpanes=0&scrollbar=1&view=Fit&zoom=65&page=${page}`
          break
        case 'firefox':
          urlWithPage = `${baseUrl}#page=${page}&zoom=page-fit&view=Fit`
          break
        case 'safari':
          urlWithPage = `${baseUrl}#page=${page}&view=Fit`
          break
        default:
          urlWithPage = `${baseUrl}#toolbar=0&navpanes=0&scrollbar=1&view=Fit&zoom=page-fit&page=${page}`
      }
    }
    setCurrentPdfUrl(urlWithPage)
  }, [])

  const goToNextPage = () => {
    if (currentPdfPage < totalPdfPages && pdfUrl) {
      const newPage = currentPdfPage + 1
      setCurrentPdfPage(newPage)
      updatePdfUrl(pdfUrl, newPage)
    }
  }

  const goToPrevPage = () => {
    if (currentPdfPage > 1 && pdfUrl) {
      const newPage = currentPdfPage - 1
      setCurrentPdfPage(newPage)
      updatePdfUrl(pdfUrl, newPage)
    }
  }

  const generatePDFPreview = useCallback(async (retryCount = 0) => {
    if (!data.personal.fullName) {
      toast.error('Please fill in your name before generating preview')
      return
    }

    setIsLoadingPreview(true)
    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: data, template, action: 'preview' }),
      })

      if (!response.ok) throw new Error('Failed to generate secure preview')

      const { pdf: base64Pdf, hasAccess, mimeType } = await response.json()
      setTemplateAccess(hasAccess ? 'granted' : 'restricted')

      const binaryString = atob(base64Pdf)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: mimeType })

      const pageCount = await getPDFPageCount(blob)
      setTotalPdfPages(pageCount)
      setCurrentPdfPage(1)

      if (usePDFJS) {
        const arrayBuffer = await blob.arrayBuffer()
        await new Promise(resolve => setTimeout(resolve, 100))
        setPdfArrayBuffer(arrayBuffer.slice(0))
        setPdfUrl(null)
      } else {
        if (currentPdfUrlRef.current) URL.revokeObjectURL(currentPdfUrlRef.current)
        const base64DataUrl = `data:${mimeType};base64,${base64Pdf}`
        setPdfUrl(base64DataUrl)
        updatePdfUrl(base64DataUrl, 1)
        currentPdfUrlRef.current = null
        setPdfArrayBuffer(null)
      }
    } catch (error) {
      console.error('[PreviewModal] Failed to generate PDF preview:', error);
      if (retryCount < 2) {
        setTimeout(() => generatePDFPreview(retryCount + 1), 1000 * (retryCount + 1))
        return
      }
      toast.error('Failed to generate PDF preview')
    } finally {
      setIsLoadingPreview(false)
    }
  }, [data, template, usePDFJS, updatePdfUrl])

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Use server-side PDF generation for security
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: data, template, action: 'download' }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed' }))
        if (response.status === 403) {
          toast.error(error.error || 'Export limit reached')
          window.open('/billing', '_blank')
          return
        }
        throw new Error(error.error || 'Failed to download')
      }

      const { pdf: base64Pdf, mimeType } = await response.json()
      
      // Convert base64 to blob
      const binaryString = atob(base64Pdf)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: mimeType })
      
      downloadBlob(blob, `${data.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`)
      toast.success('Resume downloaded successfully!')
    } catch (error) {
      console.error('[PreviewModal] Failed to download resume:', error);
      toast.error('Failed to download resume')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  useEffect(() => {
    if (isOpen && data.personal.fullName) {
      setIsLoadingPreview(true)
      setPdfArrayBuffer(null)
      setPdfUrl(null)
      setCurrentPdfUrl(null)
      const timer = setTimeout(() => generatePDFPreview(), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, data, template, generatePDFPreview])

  useEffect(() => {
    if (!isOpen) {
      setPdfArrayBuffer(null)
      setPdfUrl(null)
      setCurrentPdfUrl(null)
      setCurrentPdfPage(1)
      setTotalPdfPages(1)
      setIsLoadingPreview(false)
      if (currentPdfUrlRef.current) {
        URL.revokeObjectURL(currentPdfUrlRef.current)
        currentPdfUrlRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (currentPdfUrlRef.current) {
        URL.revokeObjectURL(currentPdfUrlRef.current)
        currentPdfUrlRef.current = null
      }
    }
  }, [])

  if (!isOpen) return null

  const isTemplateRestricted = !availableTemplates.includes(template)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden pdf-preview-modal">
        <PreviewModalHeader
          template={template}
          isTemplateRestricted={isTemplateRestricted}
          isLoadingPreview={isLoadingPreview}
          isGeneratingPDF={isGeneratingPDF}
          hasName={!!data.personal.fullName}
          pdfUrl={pdfUrl}
          isMobile={isMobile}
          usePDFJS={usePDFJS}
          currentPdfPage={currentPdfPage}
          totalPdfPages={totalPdfPages}
          onRefresh={() => generatePDFPreview()}
          onDownload={handleDownloadPDF}
          onClose={onClose}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
        />

        <div className="h-[calc(90vh-120px)]">
          <PreviewModalContent
            isLoadingPreview={isLoadingPreview}
            usePDFJS={usePDFJS}
            pdfArrayBuffer={pdfArrayBuffer}
            pdfUrl={pdfUrl}
            currentPdfUrl={currentPdfUrl}
            isMobile={isMobile}
            templateAccess={templateAccess}
            currentPdfPage={currentPdfPage}
            hasName={!!data.personal.fullName}
            iframeRef={iframeRef}
            onGeneratePreview={() => generatePDFPreview()}
          />
        </div>
      </div>
    </div>
  )
}
