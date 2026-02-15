import { requireAdmin } from '@/lib/admin'
import { getSystemSettings, updateSystemSettings } from '@/lib/system-settings'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    await requireAdmin()
    const settings = await getSystemSettings()

    return successResponse({
      maxFreeResumes: settings.maxFreeResumes,
      maxFreeAIUsage: settings.maxFreeAIUsage,
      maxFreeExports: settings.maxFreeExports,
      maxFreeImports: settings.maxFreeImports,
      maxFreeATSChecks: settings.maxFreeATSChecks,
      maxProResumes: settings.maxProResumes,
      maxProAIUsage: settings.maxProAIUsage,
      maxProExports: settings.maxProExports,
      maxProImports: settings.maxProImports,
      maxProATSChecks: settings.maxProATSChecks,
      freeTemplates: settings.freeTemplates,
      proTemplates: settings.proTemplates,
      photoUploadPlans: settings.photoUploadPlans,
      proPlanPrice: settings.proPlanPrice,
      maintenanceMode: settings.maintenanceMode
    })
  } catch (error) {
    console.error('[AdminSettings] Failed to get settings:', error);
    return forbiddenResponse('Unauthorized')
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const newSettings = await req.json()
    const savedSettings = await updateSystemSettings(newSettings)

    return successResponse({
      success: true,
      settings: savedSettings
    })
  } catch (error) {
    console.error('[AdminSettings] Failed to update settings:', error);
    return errorResponse('Failed to update settings', 500)
  }
}
