import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkUserLimits } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return authErrorResponse()
    }

    const { success, resetIn } = rateLimit(request, { maxRequests: 20, windowSeconds: 60, identifier: 'analytics-download', userId })
    if (!success) return rateLimitResponse(resetIn)

    // Check export limits before allowing download
    const limits = await checkUserLimits(userId)
    
    if (!limits.canExport) {
      return forbiddenResponse('Export limit reached. Please upgrade your plan.')
    }

    if (!limits.subscription) {
      return notFoundResponse('User subscription not found.')
    }

    const { template } = await request.json()

    // Check if user can use the selected template
    if (!limits.availableTemplates?.includes(template)) {
      return forbiddenResponse(`Template "${template}" is not available for your ${limits.subscription.plan} plan. Available templates: ${limits.availableTemplates?.join(', ') || 'none'}`)
    }

    // Update export count in database using the subscription ID from the limits check
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { exportCount: { increment: 1 } }
    })

    // Log download event (removed console.log)

    return successResponse({ success: true })
  } catch (error) {
    console.error('[AnalyticsDownload] Failed to track download:', error);
    return errorResponse('Internal error', 500)
  }
}