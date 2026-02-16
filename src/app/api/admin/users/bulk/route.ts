import { NextRequest } from 'next/server'
import { requireAdminWithId, logAdminAction } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf'
import { PLAN_NAMES, SUBSCRIPTION_DURATION_MS } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(req)
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403)
    }

    // Rate limit by total affected users: 5 requests/min with max 50 users each = 250 users/min
    const { success, resetIn } = rateLimit(req, { maxRequests: 5, windowSeconds: 60, identifier: 'admin-bulk-users', userId: adminId })
    if (!success) return rateLimitResponse(resetIn)

    const { userIds, action } = await req.json()

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return validationErrorResponse('userIds must be a non-empty array')
    }

    if (userIds.length > 50) {
      return validationErrorResponse('Cannot process more than 50 users at once')
    }

    if (!['upgrade', 'downgrade', 'delete'].includes(action)) {
      return validationErrorResponse('action must be "upgrade", "downgrade", or "delete"')
    }

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

          if (action === 'delete') {
            // Skip admin users — don't allow deleting admins
            if (user.role === 'ADMIN') {
              failureCount++
              continue
            }

            await tx.user.delete({ where: { id: userId } })
            successCount++
          } else {
            const plan = action === 'upgrade' ? PLAN_NAMES.PRO : PLAN_NAMES.FREE

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
                  endDate: plan === PLAN_NAMES.FREE ? null : new Date(Date.now() + SUBSCRIPTION_DURATION_MS)
                }
              })
            } else {
              await tx.subscription.create({
                data: {
                  userId,
                  plan,
                  status: 'ACTIVE',
                  startDate: new Date(),
                  endDate: plan === PLAN_NAMES.FREE ? null : new Date(Date.now() + SUBSCRIPTION_DURATION_MS)
                }
              })
            }

            successCount++
          }
        } catch {
          failureCount++
        }
      }
    })

    await logAdminAction(adminId, action === 'delete' ? 'BULK_DELETE_USERS' : `BULK_${action.toUpperCase()}`, 'users', {
      userIds,
      successCount,
      failureCount
    })

    return successResponse({
      success: true,
      message: `Bulk ${action} completed`,
      successCount,
      failureCount
    })
  } catch (error) {
    devError('[AdminBulkUsers] Failed to process bulk action:', error)
    return errorResponse('Failed to process bulk action', 500)
  }
}
