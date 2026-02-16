import { auth, clerkClient } from '@clerk/nextjs/server'
import { getCurrentUser, checkUserLimits } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { SystemSettings } from '@/types/api'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PLAN_NAMES } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'

async function getSystemSettings() {
  try {
    const settingsRecord = await prisma.$queryRawUnsafe(`
      SELECT
        "maxFreeResumes",
        "maxFreeAIUsage",
        "maxFreeExports",
        "maxFreeImports",
        "maxFreeATSChecks",
        "maxProResumes",
        "maxProAIUsage",
        "maxProExports",
        "maxProImports",
        "maxProATSChecks",
        "proPlanPrice"
      FROM "SystemSettings"
      ORDER BY id LIMIT 1
    `) as SystemSettings[]

    if (settingsRecord && settingsRecord.length > 0) {
      return settingsRecord[0]
    }
  } catch {
    // Silent error handling
  }

  const defaults: SystemSettings = {
    // Free Plan Limits
    maxFreeResumes: 10,
    maxFreeAIUsage: 100,
    maxFreeExports: 20,
    maxFreeImports: 1,
    maxFreeATSChecks: 0,

    // Pro Plan Limits
    maxProResumes: -1,
    maxProAIUsage: -1,
    maxProExports: -1,
    maxProImports: -1,
    maxProATSChecks: -1
  }
  return defaults
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return authErrorResponse()
    }

    let user = await getCurrentUser()
    if (!user || !user.subscription) {
      // Auto-create user if webhook hasn't fired yet
      let email = ''
      let name = ''
      try {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        email = clerkUser.emailAddresses?.[0]?.emailAddress || ''
        name = clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : ''
      } catch { /* fallback */ }

      user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {},
        create: {
          clerkId: userId,
          email,
          name,
          subscription: {
            create: {
              plan: PLAN_NAMES.FREE,
              resumeCount: 0,
              aiUsageCount: 0,
              exportCount: 0,
              importCount: 0,
              atsUsageCount: 0,
            }
          }
        },
        include: { subscription: true }
      })

      if (!user.subscription) {
        return notFoundResponse('User subscription not found')
      }
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
