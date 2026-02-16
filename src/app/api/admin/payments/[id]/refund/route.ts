import { NextRequest } from 'next/server'
import { requireAdminWithId, logAdminAction } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf'
import { PLAN_NAMES } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdminWithId()

    const csrfToken = getCsrfTokenFromRequest(req)
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403)
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 10, windowSeconds: 60, identifier: 'admin-payment-refund' })
    if (!success) return rateLimitResponse(resetIn)

    const { id } = await params

    let body: { note?: string }
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        select: { id: true, userId: true, plan: true, status: true },
      })

      if (!payment) throw new Error('Payment not found')
      if (payment.status !== 'APPROVED') {
        throw new Error('Only approved payments can be refunded')
      }

      // Mark payment as refunded
      await tx.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          adminNote: body.note || 'Refunded by admin',
          reviewedAt: new Date(),
        },
      })

      // Downgrade user to FREE
      const existingSub = await tx.subscription.findUnique({
        where: { userId: payment.userId },
      })

      if (existingSub) {
        await tx.subscription.update({
          where: { userId: payment.userId },
          data: {
            plan: PLAN_NAMES.FREE,
            status: 'ACTIVE',
            endDate: null,
          },
        })
      }

      return { paymentId: payment.id, userId: payment.userId }
    })

    await logAdminAction(adminId, 'REFUND_PAYMENT', `payment:${id}`, {
      paymentId: id,
      note: body.note || null,
    })

    return successResponse({ success: true, message: 'Payment refunded and user downgraded to FREE', ...result })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    if (error instanceof Error && error.message === 'Payment not found') {
      return errorResponse('Payment not found', 404)
    }
    if (error instanceof Error && error.message === 'Only approved payments can be refunded') {
      return errorResponse(error.message, 400)
    }
    devError('[AdminPaymentRefund] Failed to refund payment:', error)
    return errorResponse('Failed to refund payment', 500)
  }
}
