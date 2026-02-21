import { useCallback, useState } from 'react'
import { Upload, X, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

interface ResumeUploaderProps {
  onUploadComplete: (data: unknown) => void
  onCancel: () => void
}

export function ResumeUploader({ onUploadComplete, onCancel }: ResumeUploaderProps) {
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('import.uploader.errors.invalidFile'))
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(t('import.uploader.errors.fileSize'))
      return
    }

    setSelectedFile(file)
  }, [t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('import.uploader.errors.uploadFailed'))
      }

      toast.success(t('import.uploader.success'))
      onUploadComplete(result.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('import.uploader.errors.uploadFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t('import.uploader.title')}</h2>
        <p className="text-gray-600">
          {t('import.uploader.description')}
        </p>
      </div>

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">{t('import.uploader.dragAndDrop')}</p>
          <p className="text-sm text-gray-500 mb-4">{t('import.uploader.or')}</p>
          <label htmlFor="file-upload">
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".pdf,.docx,.doc"
              onChange={handleFileInputChange}
            />
            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
              {t('import.uploader.browseFiles')}
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-4">
            {t('import.uploader.supportedFormats')}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isUploading && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>{t('import.uploader.processingResume')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{t('import.uploader.whatHappensNext')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('import.uploader.step1')}</li>
                  <li>{t('import.uploader.step2')}</li>
                  <li>{t('import.uploader.step3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          {t('import.uploader.cancel')}
        </Button>
        {selectedFile && (
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                {t('import.uploader.processing')}
              </>
            ) : (
              t('import.uploader.processResume')
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}