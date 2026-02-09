'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, User, Crop } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CropModal } from './CropModal'
import { CropData } from '@/lib/image-utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface ImageUploaderProps {
  currentImage?: string
  originalImage?: string
  cropData?: CropData
  templateId?: string
  onImageUpload: (imageDataUrl: string, originalImage?: string) => void
  onImageRemove: () => void
  onCropUpdate?: (croppedImage: string, cropData: CropData) => void
}

export default function ImageUploader({ 
  currentImage, 
  originalImage, 
  templateId = 'modern',
  onImageUpload, 
  onImageRemove, 
  onCropUpdate 
}: ImageUploaderProps) {
  const { t } = useLanguage()
  const [dragActive, setDragActive] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpload(result, result) // Store as both current and original
        // Auto-open crop modal after upload
        if (onCropUpdate) {
          setShowCropModal(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropSave = (croppedImage: string, newCropData: CropData) => {
    if (onCropUpdate) {
      onCropUpdate(croppedImage, newCropData)
    }
    setShowCropModal(false)
  }

  const handleCropClick = () => {
    setShowCropModal(true)
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('forms.personalInfo.fields.profilePhoto')}
      </label>
      
      {currentImage ? (
        <div className="relative w-32 h-32 mx-auto mb-4">
          <Image
            src={currentImage}
            alt="Profile"
            fill
            className="rounded-full object-cover border-4 border-gray-200"
          />
          <button
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`relative w-32 h-32 mx-auto mb-4 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <User size={48} className="text-gray-400" />
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="flex justify-center space-x-2">
          <button
            onClick={onButtonClick}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} className="mr-2" />
{currentImage ? t('forms.personalInfo.changePhoto') : t('forms.personalInfo.uploadPhoto')}
          </button>
          
          {currentImage && originalImage && onCropUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCropClick}
              className="inline-flex items-center"
            >
              <Crop size={16} className="mr-2" />
              {t('forms.personalInfo.cropPhoto')}
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />

      <p className="text-xs text-gray-500 text-center mt-2">
        {t('forms.personalInfo.photoInstructions')}
      </p>

      {/* Crop Modal */}
      {showCropModal && originalImage && (
        <CropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageDataURL={originalImage}
          templateId={templateId}
          onSave={handleCropSave}
        />
      )}
    </div>
  )
}