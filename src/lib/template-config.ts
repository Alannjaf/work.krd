// Template configuration for profile image cropping

export interface CropConfig {
  shape: 'circle' | 'square' | 'rounded-square' | 'rectangle'
  aspectRatio: number
  borderRadius?: number
  minSize: number
  maxSize: number
  defaultSize: number
  position: {
    x: number
    y: number
  }
  safeArea: {
    padding: number
    showGuide: boolean
    color: string
  }
}

export interface TemplateConfig {
  id: string
  name: string
  crop: CropConfig
}

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    crop: {
      shape: 'circle',
      aspectRatio: 1,
      minSize: 120,
      maxSize: 200,
      defaultSize: 150,
      position: { x: 0.5, y: 0.5 },
      safeArea: {
        padding: 10,
        showGuide: true,
        color: '#3b82f6'
      }
    }
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant Dark',
    crop: {
      shape: 'square',
      aspectRatio: 1,
      minSize: 120,
      maxSize: 200,
      defaultSize: 160,
      position: { x: 0.5, y: 0.5 },
      safeArea: {
        padding: 10,
        showGuide: true,
        color: '#c9a84c'
      }
    }
  },
  bold: {
    id: 'bold',
    name: 'Bold Creative',
    crop: {
      shape: 'square',
      aspectRatio: 1,
      minSize: 120,
      maxSize: 240,
      defaultSize: 200,
      position: { x: 0.5, y: 0.5 },
      safeArea: {
        padding: 10,
        showGuide: true,
        color: '#2b2b2b'
      }
    }
  },
  developer: {
    id: 'developer',
    name: 'Developer',
    crop: {
      shape: 'circle',
      aspectRatio: 1,
      minSize: 80,
      maxSize: 160,
      defaultSize: 110,
      position: { x: 0.5, y: 0.5 },
      safeArea: {
        padding: 10,
        showGuide: true,
        color: '#a6e3a1'
      }
    }
  },
}

// Get template crop configuration
export function getTemplateCropConfig(templateId: string): CropConfig {
  return TEMPLATE_CONFIGS[templateId]?.crop || TEMPLATE_CONFIGS.modern.crop
}

// Check if template has specific crop requirements
export function hasCustomCropConfig(templateId: string): boolean {
  return templateId in TEMPLATE_CONFIGS
}

// Get all available templates for cropping
export function getAvailableTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATE_CONFIGS)
}