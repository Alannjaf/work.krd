import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithId, logAdminAction } from '@/lib/admin'
import { getSystemSettings, updateSystemSettings, invalidateSettingsCache } from '@/lib/system-settings'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { attachCsrfToken, validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf'
import { prisma } from '@/lib/prisma'
import { devError } from '@/lib/admin-utils'

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

export async function GET(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-settings' })
    if (!success) return rateLimitResponse(resetIn)

    const settings = await getSystemSettings()

    const response = NextResponse.json({
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

    return attachCsrfToken(response, adminId)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return forbiddenResponse('Unauthorized')
    }
    devError('[AdminSettings] Failed to get settings:', error);
    return errorResponse('Failed to get settings', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(req)
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403)
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-settings' })
    if (!success) return rateLimitResponse(resetIn)

    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Invalid settings: ' + parsed.error.issues.map(i => i.message).join(', '), 400)
    }

    // Snapshot current settings before saving
    try {
      const currentSettings = await getSystemSettings()
      await prisma.settingsSnapshot.create({
        data: {
          data: currentSettings,
          savedBy: adminId,
        }
      })
      // Prune old snapshots — keep only last 5
      const allSnapshots = await prisma.settingsSnapshot.findMany({
        orderBy: { createdAt: 'desc' },
        skip: 5,
        select: { id: true }
      })
      if (allSnapshots.length > 0) {
        await prisma.settingsSnapshot.deleteMany({
          where: { id: { in: allSnapshots.map((s) => s.id) } }
        })
      }
    } catch (snapshotError) {
      // Log but don't block the save — snapshots are best-effort
      devError('[AdminSettings] Failed to create snapshot:', snapshotError)
    }

    const savedSettings = await updateSystemSettings(parsed.data)
    invalidateSettingsCache()

    await logAdminAction(adminId, 'UPDATE_SETTINGS', 'system_settings', {
      updatedFields: Object.keys(parsed.data),
    })

    return successResponse({
      success: true,
      settings: savedSettings
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return forbiddenResponse('Unauthorized')
    }
    devError('[AdminSettings] Failed to update settings:', error);
    return errorResponse('Failed to update settings', 500)
  }
}
