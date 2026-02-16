import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithId, logAdminAction } from '@/lib/admin'
import { updateSystemSettings, invalidateSettingsCache } from '@/lib/system-settings'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getCsrfTokenFromRequest, validateCsrfToken, attachCsrfToken } from '@/lib/csrf'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-settings-history' })
    if (!success) return rateLimitResponse(resetIn)

    const snapshots = await (prisma as any).settingsSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, savedBy: true, createdAt: true }
    })

    const response = NextResponse.json({ snapshots })
    return attachCsrfToken(response, adminId)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return forbiddenResponse('Unauthorized')
    }
    console.error('[AdminSettings] Failed to load settings history:', error)
    return errorResponse('Failed to load settings history', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    const csrfToken = getCsrfTokenFromRequest(req)
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403)
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 10, windowSeconds: 60, identifier: 'admin-settings-revert' })
    if (!success) return rateLimitResponse(resetIn)

    const { snapshotId } = await req.json()
    if (!snapshotId) return errorResponse('Missing snapshotId', 400)

    const snapshot = await (prisma as any).settingsSnapshot.findUnique({
      where: { id: snapshotId }
    })
    if (!snapshot) return errorResponse('Snapshot not found', 404)

    // Restore settings from snapshot
    await updateSystemSettings(snapshot.data)
    invalidateSettingsCache()

    await logAdminAction(adminId, 'REVERT_SETTINGS', 'system_settings', {
      snapshotId,
      snapshotDate: snapshot.createdAt,
    })

    return successResponse({ success: true, settings: snapshot.data })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return forbiddenResponse('Unauthorized')
    }
    console.error('[AdminSettings] Failed to revert settings:', error)
    return errorResponse('Failed to revert settings', 500)
  }
}
