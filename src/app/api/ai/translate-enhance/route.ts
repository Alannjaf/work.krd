import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AIService } from '@/lib/ai'
import { getCurrentUser, checkUserLimits } from '@/lib/db'
import { detectLanguage } from '@/lib/languageDetection'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { successResponse, errorResponse, authErrorResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers'

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
    const { 
      content, 
      contentType, 
      sourceLanguage, 
      contextInfo 
    } = body

    if (!content) {
      return validationErrorResponse('Content is required')
    }

    if (!contentType) {
      return validationErrorResponse('Content type is required')
    }

    // Detect source language if not provided
    let detectedLanguage = sourceLanguage
    if (!detectedLanguage || detectedLanguage === 'auto') {
      const detected = detectLanguage(content)
      detectedLanguage = detected === 'en' ? 'auto' : detected
    }

    // Validate content type
    const validContentTypes = ['personal', 'summary', 'description', 'achievement', 'project']
    if (!validContentTypes.includes(contentType)) {
      return validationErrorResponse('Invalid content type. Must be one of: ' + validContentTypes.join(', '))
    }

    const { prisma } = await import('@/lib/prisma')
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { aiUsageCount: { increment: 1 } }
    })

    const enhancedContent = await AIService.translateAndEnhance(
      content,
      contentType,
      detectedLanguage,
      contextInfo
    )

    return successResponse({
      enhancedContent,
      detectedLanguage: detectedLanguage === 'auto' ? 'unknown' : detectedLanguage
    })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to translate and enhance content', 500)
  }
}