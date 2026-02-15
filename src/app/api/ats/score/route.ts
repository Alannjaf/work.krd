import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkUserLimits } from '@/lib/db'
import { AIService } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  const { success, resetIn } = rateLimit(request, {
    maxRequests: 10,
    windowSeconds: 60,
    identifier: 'ats-score',
  });
  if (!success) return rateLimitResponse(resetIn);

  try {
    const { userId } = await auth()
    if (!userId) {
      return authErrorResponse()
    }

    // Check user limits for ATS
    const limits = await checkUserLimits(userId)

    if (!limits.subscription) {
      return notFoundResponse('Subscription not found')
    }

    if (!limits.canUseATS) {
      return NextResponse.json({
        error: 'ATS check limit reached. Please upgrade your plan.',
        limit: limits.atsLimit,
        used: limits.atsUsed
      }, { status: 403 })
    }

    const body = await request.json()
    const { resumeData } = body

    if (!resumeData) {
      return validationErrorResponse('Resume data is required')
    }

    // Analyze ATS score
    const result = await AIService.analyzeATSScore(resumeData)

    // Atomically increment ATS usage count (race-condition safe)
    let updatedSubscription
    if (limits.atsLimit === -1) {
      // Unlimited plan — just increment
      updatedSubscription = await prisma.subscription.update({
        where: { id: limits.subscription.id },
        data: { atsUsageCount: { increment: 1 } }
      })
    } else {
      // Limited plan — atomic check-and-increment
      const updateResult = await prisma.subscription.updateMany({
        where: {
          id: limits.subscription.id,
          atsUsageCount: { lt: limits.atsLimit }
        },
        data: { atsUsageCount: { increment: 1 } }
      })
      if (updateResult.count === 0) {
        return NextResponse.json({
          error: 'ATS check limit reached. Please upgrade your plan.',
          limit: limits.atsLimit,
          used: limits.atsUsed
        }, { status: 403 })
      }
      // Fetch updated count
      updatedSubscription = await prisma.subscription.findUnique({
        where: { id: limits.subscription.id },
        select: { atsUsageCount: true }
      })
    }

    return successResponse({
      ...result,
      usage: {
        used: updatedSubscription?.atsUsageCount ?? limits.atsUsed + 1,
        limit: limits.atsLimit
      }
    })
  } catch (error) {
    return errorResponse('Failed to analyze ATS score', 500)
  }
}
