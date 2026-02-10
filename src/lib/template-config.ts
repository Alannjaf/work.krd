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
  professional: {
    id: 'professional',
    name: 'Professional',
    crop: {
      shape: 'square',
      aspectRatio: 1,
      minSize: 140,
      maxSize: 180,
      defaultSize: 160,
      position: { x: 0.5, y: 0.4 },
      safeArea: {
        padding: 8,
        showGuide: true,
        color: '#059669'
      }
    }
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    crop: {
      shape: 'rounded-square',
      aspectRatio: 1,
      borderRadius: 16,
      minSize: 130,
      maxSize: 190,
      defaultSize: 160,
      position: { x: 0.5, y: 0.45 },
      safeArea: {
        padding: 12,
        showGuide: true,
        color: '#7c3aed'
      }
    }
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    crop: {
      shape: 'rectangle',
      aspectRatio: 0.8,
      minSize: 120,
      maxSize: 170,
      defaultSize: 145,
      position: { x: 0.5, y: 0.35 },
      safeArea: {
        padding: 6,
        showGuide: true,
        color: '#dc2626'
      }
    }
  }
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