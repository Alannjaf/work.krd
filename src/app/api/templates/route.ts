import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllTemplates } from '@/lib/templates'

interface TemplateWithTier {
  id: string
  name: string
  description: string
  category: 'professional' | 'creative' | 'minimal'
  tier: 'free' | 'basic' | 'pro'
  thumbnail: string
}

interface TemplatesByTier {
  free: TemplateWithTier[]
  basic: TemplateWithTier[]
  pro: TemplateWithTier[]
}

export async function GET() {
  try {
    // Get system settings for template tier configuration
    const systemSettings = await prisma.systemSettings.findFirst()
    
    if (!systemSettings) {
      // Fallback to default settings if none exist
      return NextResponse.json({
        free: [],
        basic: [],
        pro: getAllTemplates().map(template => ({
          ...template,
          tier: 'pro' as const,
          thumbnail: `/thumbnails/${template.id}.svg`
        }))
      })
    }

    // Parse template arrays from database JSON
    const freeTemplates = Array.isArray(systemSettings.freeTemplates) 
      ? systemSettings.freeTemplates as string[]
      : JSON.parse(systemSettings.freeTemplates as string) as string[]
    
    const basicTemplates = Array.isArray(systemSettings.basicTemplates)
      ? systemSettings.basicTemplates as string[]
      : JSON.parse(systemSettings.basicTemplates as string) as string[]
    
    const proTemplates = Array.isArray(systemSettings.proTemplates)
      ? systemSettings.proTemplates as string[]
      : JSON.parse(systemSettings.proTemplates as string) as string[]

    // Get all available templates
    const allTemplates = getAllTemplates()
    
    // Organize templates by tier
    const templatesByTier: TemplatesByTier = {
      free: [],
      basic: [],
      pro: []
    }

    allTemplates.forEach(template => {
      const templateWithThumbnail: TemplateWithTier = {
        ...template,
        tier: 'pro', // default tier
        thumbnail: `/thumbnails/${template.id}.svg`
      }

      // Determine tier (check in order: free -> basic -> pro)
      if (freeTemplates.includes(template.id)) {
        templateWithThumbnail.tier = 'free'
        templatesByTier.free.push(templateWithThumbnail)
      } else if (basicTemplates.includes(template.id)) {
        templateWithThumbnail.tier = 'basic'
        templatesByTier.basic.push(templateWithThumbnail)
      } else if (proTemplates.includes(template.id)) {
        templateWithThumbnail.tier = 'pro'
        templatesByTier.pro.push(templateWithThumbnail)
      }
    })

    return NextResponse.json(templatesByTier)
  } catch (error) {
    console.error('[Templates] Failed to fetch templates:', error);
    return NextResponse.json({
      error: 'Failed to fetch templates'
    }, { status: 500 })
  }
}