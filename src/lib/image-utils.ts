// Image processing utilities for cropping functionality

export interface CropData {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

export interface ImageDimensions {
  width: number
  height: number
}

// Load image from data URL or file
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Get image dimensions from data URL
export function getImageDimensions(dataURL: string): Promise<ImageDimensions> {
  return loadImage(dataURL).then(img => ({
    width: img.naturalWidth,
    height: img.naturalHeight
  }))
}

// Apply crop to image and return cropped data URL
export async function applyCrop(
  imageDataURL: string, 
  cropData: CropData,
  outputSize: { width: number; height: number }
): Promise<string> {
  const img = await loadImage(imageDataURL)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  canvas.width = outputSize.width
  canvas.height = outputSize.height

  // Use crop data directly - coordinates are in original image space
  const sourceX = cropData.x
  const sourceY = cropData.y
  const sourceWidth = cropData.width
  const sourceHeight = cropData.height

  // Draw the cropped portion (drawImage handles out-of-bounds gracefully)
  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, outputSize.width, outputSize.height
  )

  return canvas.toDataURL('image/jpeg', 0.9)
}

// Resize image to fit within bounds while maintaining aspect ratio
export function calculateFitDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions {
  const aspectRatio = originalWidth / originalHeight
  
  let width = maxWidth
  let height = maxWidth / aspectRatio
  
  if (height > maxHeight) {
    height = maxHeight
    width = maxHeight * aspectRatio
  }
  
  return { width, height }
}

// Calculate initial crop position and size
export function calculateInitialCrop(
  imageWidth: number,
  imageHeight: number,
  cropAspectRatio: number,
  scale: number = 1
): CropData {
  const imageAspectRatio = imageWidth / imageHeight
  
  let cropWidth: number
  let cropHeight: number
  
  if (imageAspectRatio > cropAspectRatio) {
    // Image is wider than crop area
    cropHeight = imageHeight * scale
    cropWidth = cropHeight * cropAspectRatio
  } else {
    // Image is taller than crop area
    cropWidth = imageWidth * scale
    cropHeight = cropWidth / cropAspectRatio
  }
  
  const x = (imageWidth * scale - cropWidth) / 2
  const y = (imageHeight * scale - cropHeight) / 2
  
  return { x, y, width: cropWidth, height: cropHeight, scale }
}

// Validate crop bounds without modifying crop dimensions
export function validateCropBounds(
  crop: CropData,
  imageWidth: number,
  imageHeight: number
): CropData {
  const scaledImageWidth = imageWidth * crop.scale
  const scaledImageHeight = imageHeight * crop.scale

  // Only constrain position, never modify crop size
  const constrainedX = Math.max(0, Math.min(crop.x, scaledImageWidth - crop.width))
  const constrainedY = Math.max(0, Math.min(crop.y, scaledImageHeight - crop.height))

  return {
    ...crop,
    x: constrainedX,
    y: constrainedY
  }
}

// Get cropped image from react-easy-crop pixel output
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('Could not get canvas context')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    img,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  )

  return canvas.toDataURL('image/jpeg', 0.9)
}