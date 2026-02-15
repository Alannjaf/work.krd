// Dynamically get all available templates from the system
export interface TemplateInfo {
  id: string
  name: string
  description: string
  category: 'professional' | 'creative' | 'minimal'
}

// This should match the templates defined in TemplateGallery.tsx
export const getAllTemplates = (): TemplateInfo[] => {
  return [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Clean, single-column layout with centered header',
      category: 'minimal'
    },
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean, professional layout with dual columns',
      category: 'professional'
    },
    {
      id: 'elegant',
      name: 'Elegant Dark',
      description: 'Dark theme with gold accents and two-column layout',
      category: 'professional'
    },
    {
      id: 'bold',
      name: 'Bold Creative',
      description: 'Dark sidebar with skill bars, HELLO greeting, and 2-column education grid',
      category: 'creative'
    },
    {
      id: 'developer',
      name: 'Developer',
      description: 'IDE-inspired dark theme with syntax highlighting accents for tech professionals',
      category: 'creative'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Vibrant two-column with circular skill rings, progress bars, and multi-color accents for designers',
      category: 'creative'
    },
  ]
}

// Get just the template IDs
export const getTemplateIds = (): string[] => {
  return getAllTemplates().map(template => template.id)
}

// Extended template interface with tier information
export interface TemplateWithTier extends TemplateInfo {
  tier: 'free' | 'pro'
  thumbnail: string
}

// Helper function to get template tier based on system settings
export const getTemplateTier = (
  templateId: string,
  freeTemplates: string[],
  proTemplates: string[]
): 'free' | 'pro' => {
  if (freeTemplates.includes(templateId)) return 'free'
  if (proTemplates.includes(templateId)) return 'pro'
  return 'pro' // default tier
}

// Helper function to get tier badge styling
export const getTierBadgeStyle = (tier: 'free' | 'pro') => {
  switch (tier) {
    case 'free':
      return {
        className: 'bg-green-100 text-green-800',
        label: '✨ Free'
      }
    case 'pro':
      return {
        className: 'bg-purple-100 text-purple-800',
        label: '👑 Pro'
      }
  }
}
