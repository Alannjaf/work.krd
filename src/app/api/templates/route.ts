import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllTemplates } from '@/lib/templates'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

interface TemplateWithTier {
  id: string
  name: string
  description: string
  category: 'professional' | 'creative' | 'minimal'
  tier: 'free' | 'pro'
  thumbnail: string
}

interface TemplatesByTier {
  free: TemplateWithTier[]
  pro: TemplateWithTier[]
}

export async function GET(req: NextRequest) {
  const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'templates' })
  if (!success) return rateLimitResponse(resetIn)

  try {
    const systemSettings = await prisma.systemSettings.findFirst()

    if (!systemSettings) {
      return successResponse({
        free: [],
        pro: getAllTemplates().map(template => ({
          ...template,
          tier: 'pro' as const,
          thumbnail: `/thumbnails/${template.id}.svg`
        }))
      })
    }

    const freeTemplates = Array.isArray(systemSettings.freeTemplates)
      ? systemSettings.freeTemplates as string[]
      : JSON.parse(systemSettings.freeTemplates as string) as string[]

    const proTemplates = Array.isArray(systemSettings.proTemplates)
      ? systemSettings.proTemplates as string[]
      : JSON.parse(systemSettings.proTemplates as string) as string[]

    const allTemplates = getAllTemplates()

    const templatesByTier: TemplatesByTier = {
      free: [],
      pro: []
    }

    allTemplates.forEach(template => {
      const templateWithThumbnail: TemplateWithTier = {
        ...template,
        tier: 'pro',
        thumbnail: `/thumbnails/${template.id}.svg`
      }

      if (freeTemplates.includes(template.id)) {
        templateWithThumbnail.tier = 'free'
        templatesByTier.free.push(templateWithThumbnail)
      } else if (proTemplates.includes(template.id)) {
        templateWithThumbnail.tier = 'pro'
        templatesByTier.pro.push(templateWithThumbnail)
      }
    })

    const response = successResponse(templatesByTier)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error) {
    console.error('[Templates] Failed to fetch templates:', error);
    return errorResponse('Failed to fetch templates', 500)
  }
}
