'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageCropper } from './ImageCropper'
import { applyCrop, CropData } from '@/lib/image-utils'
import { getTemplateCropConfig } from '@/lib/template-config'
import { useLanguage } from '@/contexts/LanguageContext'

interface CropModalProps {
  isOpen: boolean
  onClose: () => void
  imageDataURL: string
  templateId: string
  onSave: (croppedImage: string, cropData: CropData) => void
}

export function CropModal({ isOpen, onClose, imageDataURL, templateId, onSave }: CropModalProps) {
  const { t } = useLanguage()
  const [currentCrop, setCurrentCrop] = useState<CropData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const cropConfig = getTemplateCropConfig(templateId)

  // Generate preview when crop changes
  useEffect(() => {
    if (!currentCrop || !imageDataURL) return

    const generatePreview = async () => {
      try {
        const preview = await applyCrop(
          imageDataURL,
          currentCrop,
          { width: cropConfig.defaultSize, height: cropConfig.defaultSize * (1 / cropConfig.aspectRatio) }
        )
        setPreviewImage(preview)
      } catch (error) {
        console.error('[CropModal] Failed to generate preview:', error);
      }
    }

    generatePreview()
  }, [currentCrop, imageDataURL, cropConfig])

  const handleSave = async () => {
    if (!currentCrop) return

    setIsProcessing(true)
    try {
      const croppedImage = await applyCrop(
        imageDataURL,
        currentCrop,
        { width: cropConfig.defaultSize, height: cropConfig.defaultSize * (1 / cropConfig.aspectRatio) }
      )
      onSave(croppedImage, currentCrop)
      onClose()
    } catch (error) {
      console.error('[CropModal] Failed to save crop:', error);
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    setCurrentCrop(null)
    setPreviewImage(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{t('forms.personalInfo.cropModal.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('forms.personalInfo.cropModal.subtitle', { shape: cropConfig.shape.replace('-', ' ') })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!currentCrop || isProcessing}
              className="min-w-[100px]"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  {t('forms.personalInfo.cropModal.saving')}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t('forms.personalInfo.cropModal.saveCrop')}
                </>
              )}
            </Button>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cropper */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">{t('forms.personalInfo.cropModal.adjustPhoto')}</h3>
              <ImageCropper
                imageDataURL={imageDataURL}
                cropConfig={cropConfig}
                onCropChange={setCurrentCrop}
              />
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-medium mb-4">{t('common.preview')}</h3>
              <div className="space-y-4">
                {/* Template preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {t('forms.personalInfo.cropModal.previewText')}
                  </p>
                  <div className="flex justify-center">
                    {previewImage ? (
                      <div
                        className={`relative overflow-hidden ${
                          cropConfig.shape === 'circle' 
                            ? 'rounded-full' 
                            : cropConfig.shape === 'rounded-square' 
                            ? 'rounded-xl' 
                            : cropConfig.shape === 'square'
                            ? 'rounded-md'
                            : 'rounded-sm'
                        }`}
                        style={{
                          width: cropConfig.defaultSize * 0.6,
                          height: (cropConfig.defaultSize * 0.6) * (1 / cropConfig.aspectRatio)
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`bg-gray-200 flex items-center justify-center ${
                          cropConfig.shape === 'circle' 
                            ? 'rounded-full' 
                            : cropConfig.shape === 'rounded-square' 
                            ? 'rounded-xl' 
                            : cropConfig.shape === 'square'
                            ? 'rounded-md'
                            : 'rounded-sm'
                        }`}
                        style={{
                          width: cropConfig.defaultSize * 0.6,
                          height: (cropConfig.defaultSize * 0.6) * (1 / cropConfig.aspectRatio)
                        }}
                      >
                        <span className="text-gray-500 text-sm">{t('common.preview')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">{t('forms.personalInfo.cropModal.tips.title')}</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• {t('forms.personalInfo.cropModal.tips.position')}</li>
                    <li>• {t('forms.personalInfo.cropModal.tips.zoom')}</li>
                    <li>• {t('forms.personalInfo.cropModal.tips.preserve')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {t('forms.personalInfo.cropModal.template')}: <span className="font-medium capitalize">{templateId}</span>
            {' • '}
            <span className="capitalize">{cropConfig.shape.replace('-', ' ')}</span> {t('forms.personalInfo.cropModal.crop')}
          </div>
        </div>
      </div>
    </div>
  )
}