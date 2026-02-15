import { z } from 'zod'
import { requireAdmin } from '@/lib/admin'
import { getSystemSettings, updateSystemSettings } from '@/lib/system-settings'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-helpers'

const settingsSchema = z.object({
  maxFreeResumes: z.number().int().min(0),
  maxFreeAIUsage: z.number().int().min(0),
  maxFreeExports: z.number().int().min(0),
  maxFreeImports: z.number().int().min(0),
  maxFreeATSChecks: z.number().int().min(0),
  maxProResumes: z.number().int().min(-1),
  maxProAIUsage: z.number().int().min(-1),
  maxProExports: z.number().int().min(-1),
  maxProImports: z.number().int().min(-1),
  maxProATSChecks: z.number().int().min(-1),
  freeTemplates: z.array(z.string()).min(1),
  proTemplates: z.array(z.string()).min(1),
  photoUploadPlans: z.array(z.string()),
  proPlanPrice: z.number().int().min(1),
  maintenanceMode: z.boolean(),
}).partial()

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
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return forbiddenResponse('Unauthorized')
    }
    console.error('[AdminSettings] Failed to get settings:', error);
    return errorResponse('Failed to get settings', 500)
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Invalid settings: ' + parsed.error.issues.map(i => i.message).join(', '), 400)
    }

    const savedSettings = await updateSystemSettings(parsed.data)

    return successResponse({
      success: true,
      settings: savedSettings
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return forbiddenResponse('Unauthorized')
    }
    console.error('[AdminSettings] Failed to update settings:', error);
    return errorResponse('Failed to update settings', 500)
  }
}
