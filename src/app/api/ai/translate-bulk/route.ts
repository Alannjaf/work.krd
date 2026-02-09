import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AIService } from '@/lib/ai'
import { getCurrentUser, checkUserLimits } from '@/lib/db'
import { detectLanguage } from '@/lib/languageDetection'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import {
  successResponse,
  errorResponse,
  authErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse
} from '@/lib/api-helpers'

const MAX_ITEMS = 50
const BATCH_SIZE = 5

interface BulkTranslateItem {
  content: string
  contentType: string
  contextInfo?: Record<string, string>
}

export async function POST(req: NextRequest) {
  const { success, resetIn } = rateLimit(req, {
    maxRequests: 30,
    windowSeconds: 60,
    identifier: 'ai',
  });
  if (!success) return rateLimitResponse(resetIn);

  try {
    const { userId } = await auth()

    if (!userId) {
      return authErrorResponse()
    }

    const user = await getCurrentUser()
    if (!user) {
      return notFoundResponse('User not found')
    }

    // Check AI usage limits using Clerk ID
    const limits = await checkUserLimits(userId)
    if (!limits.canUseAI) {
      return forbiddenResponse('AI usage limit reached. Please upgrade your plan.')
    }

    if (!limits.subscription) {
      return notFoundResponse('User subscription not found.')
    }

    const body = await req.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return validationErrorResponse('Items must be a non-empty array')
    }

    if (items.length > MAX_ITEMS) {
      return validationErrorResponse(`Maximum ${MAX_ITEMS} items per request`)
    }

    const validContentTypes = ['personal', 'summary', 'description', 'achievement', 'project']

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.content) {
        return validationErrorResponse(`Item at index ${i} is missing content`)
      }
      if (!item.contentType) {
        return validationErrorResponse(`Item at index ${i} is missing contentType`)
      }
      if (!validContentTypes.includes(item.contentType)) {
        return validationErrorResponse(`Item at index ${i} has invalid contentType. Must be one of: ${validContentTypes.join(', ')}`)
      }
    }

    // Process items in parallel batches
    const translations: Array<{ enhancedContent: string; detectedLanguage: string }> = new Array(items.length)

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE) as BulkTranslateItem[]

      await Promise.all(batch.map(async (item, batchIndex) => {
        const globalIndex = i + batchIndex
        try {
          // Detect source language
          const detected = detectLanguage(item.content)
          const detectedLanguage = detected === 'en' ? 'auto' : detected

          const enhancedContent = await AIService.translateAndEnhance(
            item.content,
            item.contentType as 'personal' | 'summary' | 'description' | 'achievement' | 'project',
            detectedLanguage as 'ar' | 'ku' | 'auto',
            item.contextInfo
          )

          translations[globalIndex] = {
            enhancedContent,
            detectedLanguage: detectedLanguage === 'auto' ? 'unknown' : detectedLanguage
          }
        } catch (error) {
          console.error(`[TranslateBulk] Failed to translate item ${globalIndex}:`, error)
          translations[globalIndex] = {
            enhancedContent: '',
            detectedLanguage: 'unknown'
          }
        }
      }))
    }

    // Increment AI usage count once for the bulk operation
    const { prisma } = await import('@/lib/prisma')
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { aiUsageCount: { increment: 1 } }
    })

    return successResponse({ translations })
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to bulk translate content',
      500
    )
  }
}
