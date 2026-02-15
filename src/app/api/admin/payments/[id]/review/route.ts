import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!payment) {
      return errorResponse('Payment not found', 404)
    }

    // Convert screenshotData Buffer to base64 data URL
    const base64 = Buffer.from(payment.screenshotData).toString('base64')
    const screenshotDataUrl = `data:${payment.screenshotType};base64,${base64}`

    return successResponse({
      id: payment.id,
      plan: payment.plan,
      amount: payment.amount,
      status: payment.status,
      adminNote: payment.adminNote,
      createdAt: payment.createdAt,
      reviewedAt: payment.reviewedAt,
      screenshot: screenshotDataUrl,
      user: payment.user,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    console.error('[AdminPaymentReview] Failed to fetch payment:', error)
    return errorResponse('Failed to fetch payment', 500)
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    let body: { action?: string; note?: string }
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse('Invalid request body')
    }

    const { action, note } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return validationErrorResponse('Action must be "approve" or "reject"')
    }

    if (note && note.length > 1000) {
      return validationErrorResponse('Note must be 1000 characters or less')
    }

    const now = new Date()

    // Payment lookup + status check + update all inside transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          plan: true,
          amount: true,
          status: true,
        },
      })

      if (!payment) throw new Error('Payment not found')
      if (payment.status !== 'PENDING') throw new Error(`Payment has already been ${payment.status.toLowerCase()}`)

      if (action === 'approve') {
        // Update payment status
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedAt: now,
            adminNote: note || null,
          },
        })

        // Upsert subscription to upgrade user
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

        const existingSubscription = await tx.subscription.findUnique({
          where: { userId: payment.userId },
        })

        if (existingSubscription) {
          await tx.subscription.update({
            where: { userId: payment.userId },
            data: {
              plan: payment.plan,
              status: 'ACTIVE',
              paymentMethod: 'FIB',
              paymentId: payment.id,
              startDate: now,
              endDate,
            },
          })
        } else {
          await tx.subscription.create({
            data: {
              userId: payment.userId,
              plan: payment.plan,
              status: 'ACTIVE',
              paymentMethod: 'FIB',
              paymentId: payment.id,
              startDate: now,
              endDate,
            },
          })
        }

        return {
          message: `Payment approved. User upgraded to ${payment.plan} plan.`,
          payment: {
            id: updatedPayment.id,
            status: updatedPayment.status,
            reviewedAt: updatedPayment.reviewedAt,
          },
        }
      } else {
        // Reject payment
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewedAt: now,
            adminNote: note || null,
          },
        })

        return {
          message: 'Payment rejected.',
          payment: {
            id: updatedPayment.id,
            status: updatedPayment.status,
            reviewedAt: updatedPayment.reviewedAt,
            adminNote: updatedPayment.adminNote,
          },
        }
      }
    })

    return successResponse({ success: true, ...result })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    if (error instanceof Error && error.message === 'Payment not found') {
      return errorResponse('Payment not found', 404)
    }
    if (error instanceof Error && error.message.startsWith('Payment has already been')) {
      return validationErrorResponse(error.message)
    }
    console.error('[AdminPaymentReview] Failed to review payment:', error)
    return errorResponse('Failed to review payment', 500)
  }
}
