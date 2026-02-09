import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkUserLimits } from '@/lib/db'
import { AIService } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
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

    // Increment ATS usage count
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { atsUsageCount: { increment: 1 } }
    })

    return successResponse({
      ...result,
      usage: {
        used: limits.atsUsed + 1,
        limit: limits.atsLimit
      }
    })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to analyze ATS score', 500)
  }
}

