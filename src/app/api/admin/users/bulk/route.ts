import { NextRequest } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf'

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(req)
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403)
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 10, windowSeconds: 60, identifier: 'admin-bulk-users' })
    if (!success) return rateLimitResponse(resetIn)

    const { userIds, action } = await req.json()

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return validationErrorResponse('userIds must be a non-empty array')
    }

    if (userIds.length > 100) {
      return validationErrorResponse('Cannot process more than 100 users at once')
    }

    if (!['upgrade', 'downgrade'].includes(action)) {
      return validationErrorResponse('action must be "upgrade" or "downgrade"')
    }

    const plan = action === 'upgrade' ? 'PRO' : 'FREE'
    let successCount = 0
    let failureCount = 0

    // Process all users in a transaction
    await prisma.$transaction(async (tx) => {
      for (const userId of userIds) {
        try {
          // Verify user exists
          const user = await tx.user.findUnique({ where: { id: userId } })
          if (!user) {
            failureCount++
            continue
          }

          const existingSubscription = await tx.subscription.findUnique({
            where: { userId }
          })

          if (existingSubscription) {
            await tx.subscription.update({
              where: { userId },
              data: {
                plan,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
            })
          } else {
            await tx.subscription.create({
              data: {
                userId,
                plan,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
            })
          }

          successCount++
        } catch {
          failureCount++
        }
      }
    })

    return successResponse({
      success: true,
      message: `Bulk ${action} completed`,
      successCount,
      failureCount
    })
  } catch (error) {
    console.error('[AdminBulkUsers] Failed to process bulk action:', error)
    return errorResponse('Failed to process bulk action', 500)
  }
}
