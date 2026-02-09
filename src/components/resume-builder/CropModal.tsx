'use client'

import { useState, useCallback } from 'react'
import { X, Check } from 'lucide-react'
import type { Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { ImageCropper } from './ImageCropper'
import { getCroppedImage, CropData } from '@/lib/image-utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface CropModalProps {
  isOpen: boolean
  onClose: () => void
  imageDataURL: string
  templateId?: string
  onSave: (croppedImage: string, cropData: CropData) => void
}

export function CropModal({ isOpen, onClose, imageDataURL, onSave }: CropModalProps) {
  const { t } = useLanguage()
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCropComplete = useCallback((pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedImage = await getCroppedImage(imageDataURL, croppedAreaPixels)
      const cropData: CropData = {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
        scale: 1,
      }
      onSave(croppedImage, cropData)
      onClose()
    } catch (error) {
      console.error('[CropModal] Failed to save crop:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('forms.personalInfo.cropModal.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper */}
        <div className="p-4">
          <ImageCropper
            imageUrl={imageDataURL}
            cropShape="round"
            aspect={1}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!croppedAreaPixels || isProcessing}
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
        </div>
      </div>
    </div>
  )
}
