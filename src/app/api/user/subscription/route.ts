import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { SystemSettings } from '@/types/api'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse } from '@/lib/api-helpers'

async function getSystemSettings() {
  try {
    const settingsRecord = await prisma.$queryRawUnsafe(`
      SELECT 
        "maxFreeResumes",
        "maxFreeAIUsage", 
        "maxFreeExports",
        "maxFreeImports",
        "maxFreeATSChecks",
        "maxBasicResumes",
        "maxBasicAIUsage",
        "maxBasicExports", 
        "maxBasicImports",
        "maxBasicATSChecks",
        "maxProResumes",
        "maxProAIUsage",
        "maxProExports",
        "maxProImports",
        "maxProATSChecks",
        "basicPlanPrice",
        "proPlanPrice"
      FROM "SystemSettings" 
      ORDER BY id LIMIT 1
    `) as SystemSettings[]

    if (settingsRecord && settingsRecord.length > 0) {
      return settingsRecord[0]
    }
  } catch (error) {
    console.error('[Subscription] Failed to fetch system settings:', error);
  }
  
  const defaults: SystemSettings = {
    // Free Plan Limits
    maxFreeResumes: 10,
    maxFreeAIUsage: 100,
    maxFreeExports: 20,
    maxFreeImports: 1,
    maxFreeATSChecks: 0,
    
    // Basic Plan Limits
    maxBasicResumes: 50,
    maxBasicAIUsage: 500,
    maxBasicExports: 100,
    maxBasicImports: 0,
    maxBasicATSChecks: 5,
    
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

    const user = await getCurrentUser()
    if (!user || !user.subscription) {
      return notFoundResponse('User not found')
    }

    const settings = await getSystemSettings()
    // System Settings from DB
    const plan = user.subscription.plan
    // User Plan loaded
    
    // Get limits based on plan and admin settings
    let resumesLimit, aiUsageLimit, exportLimit, importLimit, atsUsageLimit
    
    if (plan === 'FREE') {
      resumesLimit = settings.maxFreeResumes !== null && settings.maxFreeResumes !== undefined ? settings.maxFreeResumes : 10
      aiUsageLimit = settings.maxFreeAIUsage !== null && settings.maxFreeAIUsage !== undefined ? settings.maxFreeAIUsage : 100
      exportLimit = settings.maxFreeExports !== null && settings.maxFreeExports !== undefined ? settings.maxFreeExports : 20
      importLimit = settings.maxFreeImports !== null && settings.maxFreeImports !== undefined ? settings.maxFreeImports : 1
      atsUsageLimit = settings.maxFreeATSChecks !== null && settings.maxFreeATSChecks !== undefined ? settings.maxFreeATSChecks : 0
    } else if (plan === 'BASIC') {
      resumesLimit = settings.maxBasicResumes !== null && settings.maxBasicResumes !== undefined ? settings.maxBasicResumes : 50
      aiUsageLimit = settings.maxBasicAIUsage !== null && settings.maxBasicAIUsage !== undefined ? settings.maxBasicAIUsage : 500
      exportLimit = settings.maxBasicExports !== null && settings.maxBasicExports !== undefined ? settings.maxBasicExports : 100
      importLimit = settings.maxBasicImports !== null && settings.maxBasicImports !== undefined ? settings.maxBasicImports : 0
      atsUsageLimit = settings.maxBasicATSChecks !== null && settings.maxBasicATSChecks !== undefined ? settings.maxBasicATSChecks : 5
    } else { // PRO
      resumesLimit = settings.maxProResumes !== null && settings.maxProResumes !== undefined ? settings.maxProResumes : -1
      aiUsageLimit = settings.maxProAIUsage !== null && settings.maxProAIUsage !== undefined ? settings.maxProAIUsage : -1
      exportLimit = settings.maxProExports !== null && settings.maxProExports !== undefined ? settings.maxProExports : -1
      importLimit = settings.maxProImports !== null && settings.maxProImports !== undefined ? settings.maxProImports : -1
      atsUsageLimit = settings.maxProATSChecks !== null && settings.maxProATSChecks !== undefined ? settings.maxProATSChecks : -1
    }
    
    // Final limits calculated
    
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