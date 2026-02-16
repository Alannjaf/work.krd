import { NextRequest } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminId = await requireAdminWithId()

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(req)
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403)
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-upgrade' })
    if (!success) return rateLimitResponse(resetIn)

    const { userId } = await params
    const { plan } = await req.json()

    if (!['FREE', 'PRO'].includes(plan)) {
      return validationErrorResponse('Invalid plan')
    }

    // Check if user has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return validationErrorResponse('User not found')
    }

    if (existingSubscription) {
      // Update existing subscription — preserve usage counts
      await prisma.subscription.update({
        where: { userId },
        data: {
          plan,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return successResponse({
      success: true,
      message: `User updated to ${plan} plan`
    })
  } catch (error) {
    console.error('[AdminUpgrade] Failed to upgrade user:', error);
    return errorResponse('Failed to upgrade user', 500)
  }
}
