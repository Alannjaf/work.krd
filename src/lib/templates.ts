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
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean, professional layout with dual columns',
      category: 'professional'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Artistic design with visual elements and colors',
      category: 'creative'
    },
    {
      id: 'executive',
      name: 'Executive Professional',
      description: 'Clean executive layout with elegant typography',
      category: 'professional'
    },
    {
      id: 'elegant',
      name: 'Elegant Professional',
      description: 'Sophisticated single-column design with navy accents',
      category: 'professional'
    },
    {
      id: 'minimalist',
      name: 'Minimalist Modern',
      description: 'Clean typography-focused design with minimal visual elements',
      category: 'minimal'
    },
    {
      id: 'creative-artistic',
      name: 'Creative Artistic',
      description: 'Vibrant and artistic design with colorful accents and decorative elements',
      category: 'creative'
    },
    {
      id: 'developer',
      name: 'Developer',
      description: 'Tech-focused design with modern elements perfect for software developers',
      category: 'professional'
    },
    {
      id: 'corporate',
      name: 'Corporate Professional',
      description: 'Structured, grid-based professional template with clear sections and formal layout',
      category: 'professional'
    },
    {
      id: 'creative-modern',
      name: 'Creative Modern',
      description: 'Contemporary creative design with geometric elements and modern typography',
      category: 'creative'
    },
    {
      id: 'classic',
      name: 'Classic Traditional',
      description: 'Traditional, conservative professional template with timeless design elements',
      category: 'professional'
    }
  ]
}

// Get just the template IDs
export const getTemplateIds = (): string[] => {
  return getAllTemplates().map(template => template.id)
}

// Extended template interface with tier information
export interface TemplateWithTier extends TemplateInfo {
  tier: 'free' | 'basic' | 'pro'
  thumbnail: string
}

// Helper function to get template tier based on system settings
export const getTemplateTier = (
  templateId: string,
  freeTemplates: string[],
  basicTemplates: string[],
  proTemplates: string[]
): 'free' | 'basic' | 'pro' => {
  if (freeTemplates.includes(templateId)) return 'free'
  if (basicTemplates.includes(templateId)) return 'basic'
  if (proTemplates.includes(templateId)) return 'pro'
  return 'pro' // default tier
}

// Helper function to get tier badge styling
export const getTierBadgeStyle = (tier: 'free' | 'basic' | 'pro') => {
  switch (tier) {
    case 'free':
      return {
        className: 'bg-green-100 text-green-800',
        label: '✨ Free'
      }
    case 'basic':
      return {
        className: 'bg-blue-100 text-blue-800',
        label: '📈 Basic'
      }
    case 'pro':
      return {
        className: 'bg-purple-100 text-purple-800',
        label: '👑 Pro'
      }
  }
}