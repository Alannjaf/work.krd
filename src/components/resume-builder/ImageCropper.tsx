'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropperProps {
  imageUrl: string
  cropShape?: 'round' | 'rect'
  aspect?: number
  onCropComplete: (croppedAreaPixels: Area) => void
}

export function ImageCropper({
  imageUrl,
  cropShape = 'round',
  aspect = 1,
  onCropComplete,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels)
    },
    [onCropComplete]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full" style={{ height: 300 }}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className="flex items-center justify-center gap-3 px-4">
        <ZoomOut className="h-4 w-4 text-gray-500 shrink-0" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full max-w-xs accent-blue-600"
        />
        <ZoomIn className="h-4 w-4 text-gray-500 shrink-0" />
      </div>
    </div>
  )
}
