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
    const { description, jobTitle, language } = body

    if (!jobTitle) {
      return validationErrorResponse('Job title is required')
    }

    // Auto-detect language from description or jobTitle
    const textToDetect = description || jobTitle
    const detectedLang = detectLanguage(textToDetect)
    // Also check jobTitle if description detection returned English
    const jobTitleLang = detectLanguage(jobTitle)
    const resolvedLanguage = (detectedLang === 'ar' || detectedLang === 'ku') ? detectedLang
      : (jobTitleLang === 'ar' || jobTitleLang === 'ku') ? jobTitleLang
      : (language || 'en')

    const enhancedDescription = await AIService.enhanceJobDescription(
      description,
      jobTitle,
      { language: resolvedLanguage }
    )

    // Update AI usage count using subscription ID
    const { prisma } = await import('@/lib/prisma')
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { aiUsageCount: { increment: 1 } }
    })

    return successResponse({ enhancedDescription })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to enhance description', 500)
  }
}