import { auth } from '@clerk/nextjs/server'
import { checkUserLimits } from '@/lib/db'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return authErrorResponse()
    }

    const limits = await checkUserLimits(userId)
    
    return successResponse({
      canCreateResume: limits.canCreateResume,
      canUseAI: limits.canUseAI,
      canExport: limits.canExport,
      canImport: limits.canImport,
      canUploadPhoto: limits.canUploadPhoto,
      canUseATS: limits.canUseATS,
      availableTemplates: limits.availableTemplates,
      canAccessProTemplates: (limits.availableTemplates?.length ?? 0) > 2, // More than basic templates
      canExportToPDF: limits.canExport
    })
  } catch (error) {
    console.error('[Permissions] Failed to fetch permissions:', error);
    return errorResponse('Failed to fetch permissions', 500)
  }
}