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

    // Find the payment and ensure it's PENDING
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        plan: true,
        amount: true,
        status: true,
      },
    })

    if (!payment) {
      return errorResponse('Payment not found', 404)
    }

    if (payment.status !== 'PENDING') {
      return validationErrorResponse(`Payment has already been ${payment.status.toLowerCase()}`)
    }

    const now = new Date()

    if (action === 'approve') {
      // Approve payment and upgrade subscription atomically
      const result = await prisma.$transaction(async (tx) => {
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

        return updatedPayment
      })

      return successResponse({
        success: true,
        message: `Payment approved. User upgraded to ${payment.plan} plan.`,
        payment: {
          id: result.id,
          status: result.status,
          reviewedAt: result.reviewedAt,
        },
      })
    } else {
      // Reject payment
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: now,
          adminNote: note || null,
        },
      })

      return successResponse({
        success: true,
        message: 'Payment rejected.',
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          reviewedAt: updatedPayment.reviewedAt,
          adminNote: updatedPayment.adminNote,
        },
      })
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    console.error('[AdminPaymentReview] Failed to review payment:', error)
    return errorResponse('Failed to review payment', 500)
  }
}
