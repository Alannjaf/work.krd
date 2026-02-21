import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AIService } from '@/lib/ai'
import { getCurrentUser, checkUserLimits } from '@/lib/db'
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
    const { jobTitle, industry, experience, skills, language } = body

    if (!jobTitle) {
      return validationErrorResponse('Job title is required')
    }

    const { prisma } = await import('@/lib/prisma')
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { aiUsageCount: { increment: 1 } }
    })

    const summary = await AIService.generateProfessionalSummary({
      jobTitle,
      industry,
      experience,
      skills,
      language: language || 'auto'
    })

    return successResponse({ summary })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to generate summary', 500)
  }
}