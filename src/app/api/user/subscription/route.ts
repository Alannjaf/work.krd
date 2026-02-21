import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '@/lib/db'
import { getSystemSettings } from '@/lib/system-settings'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PLAN_NAMES } from '@/lib/constants'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return authErrorResponse()
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 20, windowSeconds: 60, identifier: 'subscription', userId })
    if (!success) return rateLimitResponse(resetIn)

    const user = await getCurrentUser()
    if (!user || !user.subscription) {
      return notFoundResponse('User not found')
    }

    const settings = await getSystemSettings()
    const plan = user.subscription.plan
    let resumesLimit, aiUsageLimit, exportLimit, importLimit, atsUsageLimit
    
    if (plan === PLAN_NAMES.FREE) {
      resumesLimit = settings.maxFreeResumes !== null && settings.maxFreeResumes !== undefined ? settings.maxFreeResumes : 10
      aiUsageLimit = settings.maxFreeAIUsage !== null && settings.maxFreeAIUsage !== undefined ? settings.maxFreeAIUsage : 100
      exportLimit = settings.maxFreeExports !== null && settings.maxFreeExports !== undefined ? settings.maxFreeExports : 20
      importLimit = settings.maxFreeImports !== null && settings.maxFreeImports !== undefined ? settings.maxFreeImports : 1
      atsUsageLimit = settings.maxFreeATSChecks !== null && settings.maxFreeATSChecks !== undefined ? settings.maxFreeATSChecks : 0
    } else { // PRO
      resumesLimit = settings.maxProResumes !== null && settings.maxProResumes !== undefined ? settings.maxProResumes : -1
      aiUsageLimit = settings.maxProAIUsage !== null && settings.maxProAIUsage !== undefined ? settings.maxProAIUsage : -1
      exportLimit = settings.maxProExports !== null && settings.maxProExports !== undefined ? settings.maxProExports : -1
      importLimit = settings.maxProImports !== null && settings.maxProImports !== undefined ? settings.maxProImports : -1
      atsUsageLimit = settings.maxProATSChecks !== null && settings.maxProATSChecks !== undefined ? settings.maxProATSChecks : -1
    }

    return successResponse({
      currentPlan: plan,
      resumesUsed: user.subscription.resumeCount,
      resumesLimit,
      aiUsageCount: user.subscription.aiUsageCount,
      aiUsageLimit,
      exportCount: user.subscription.exportCount || 0,
      exportLimit,
      importCount: user.subscription.importCount || 0,
      importLimit,
      atsUsageCount: user.subscription.atsUsageCount || 0,
      atsUsageLimit
    })
  } catch (error) {
    console.error('[Subscription] Failed to get subscription info:', error);
    return errorResponse('Internal server error', 500)
  }
}