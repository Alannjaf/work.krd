import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, checkUserLimits } from '@/lib/db'
import { getSystemSettings } from '@/lib/system-settings'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { PLAN_NAMES } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return authErrorResponse()
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 20, windowSeconds: 60, identifier: 'subscription-data', userId })
    if (!success) return rateLimitResponse(resetIn)

    const user = await getCurrentUser()
    if (!user || !user.subscription) {
      // User not yet in DB (webhook may not have fired) — return free plan defaults
      const settings = await getSystemSettings()
      return successResponse({
        subscription: {
          currentPlan: PLAN_NAMES.FREE,
          resumesUsed: 0,
          resumesLimit: settings.maxFreeResumes ?? 10,
          aiUsageCount: 0,
          aiUsageLimit: settings.maxFreeAIUsage ?? 100,
          exportCount: 0,
          exportLimit: settings.maxFreeExports ?? 20,
          importCount: 0,
          importLimit: settings.maxFreeImports ?? 1,
          atsUsageCount: 0,
          atsUsageLimit: settings.maxFreeATSChecks ?? 0,
        },
        permissions: {
          canCreateResume: true,
          canUseAI: true,
          canExport: true,
          canImport: true,
          canUploadPhoto: true,
          canUseATS: false,
          availableTemplates: ['modern', 'minimal', 'professional'],
          canAccessProTemplates: false,
          canExportToPDF: true,
        },
      })
    }

    // Get both subscription data and permissions in parallel
    const [settings, limits] = await Promise.all([
      getSystemSettings(),
      checkUserLimits(userId)
    ])

    const plan = user.subscription.plan

    // Calculate limits based on plan (same logic as subscription/route.ts)
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

    const response = successResponse({
      // Subscription data
      subscription: {
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
        atsUsageLimit,
      },
      // Permissions data
      permissions: {
        canCreateResume: limits.canCreateResume,
        canUseAI: limits.canUseAI,
        canExport: limits.canExport,
        canImport: limits.canImport,
        canUploadPhoto: limits.canUploadPhoto,
        canUseATS: limits.canUseATS,
        availableTemplates: limits.availableTemplates,
        canAccessProTemplates: (limits.availableTemplates?.length ?? 0) > 2,
        canExportToPDF: limits.canExport,
      },
    })
    // Prevent caching of sensitive subscription data
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (error) {
    devError('[SubscriptionData] Failed to fetch:', error)
    return errorResponse('Internal server error', 500)
  }
}
