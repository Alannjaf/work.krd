import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkUserLimits } from '@/lib/db'
import { AIService } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers'
import { resumeDataSchema, MAX_REQUEST_SIZE } from '@/lib/ats-utils'

export async function POST(request: NextRequest) {
  // Check request size (Issue #12)
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return validationErrorResponse('Request too large (maximum 1MB)')
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return authErrorResponse()
    }

    // Rate limit with userId+IP (Issue #11)
    const { success, resetIn } = rateLimit(request, {
      maxRequests: 10,
      windowSeconds: 60,
      identifier: 'ats-keywords',
      userId,
    });
    if (!success) return rateLimitResponse(resetIn);

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
    const { resumeData, jobDescription } = body

    if (!resumeData) {
      return validationErrorResponse('Resume data is required')
    }

    // Validate resume data shape (Issue #8)
    const parseResult = resumeDataSchema.safeParse(resumeData)
    if (!parseResult.success) {
      return validationErrorResponse('Invalid resume data format')
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return validationErrorResponse('Job description is required (minimum 50 characters)')
    }

    if (jobDescription.length > 10000) {
      return validationErrorResponse('Job description is too long (maximum 10,000 characters)')
    }

    // Atomically increment BEFORE AI call (Issue #1)
    let updatedSubscription
    if (limits.atsLimit === -1) {
      updatedSubscription = await prisma.subscription.update({
        where: { id: limits.subscription.id },
        data: { atsUsageCount: { increment: 1 } }
      })
    } else {
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
      updatedSubscription = await prisma.subscription.findUnique({
        where: { id: limits.subscription.id },
        select: { atsUsageCount: true }
      })
    }

    // Match keywords (after successful increment)
    const result = await AIService.matchKeywords(parseResult.data, jobDescription)

    return successResponse({
      ...result,
      usage: {
        used: updatedSubscription?.atsUsageCount ?? limits.atsUsed + 1,
        limit: limits.atsLimit
      }
    })
  } catch (error) {
    console.error('[ATS Keywords]', error)
    return errorResponse('Failed to match keywords', 500)
  }
}
