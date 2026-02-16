import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { attachCsrfToken, validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-payment-review' })
    if (!success) return rateLimitResponse(resetIn)

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

    const response = NextResponse.json({
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

    return attachCsrfToken(response, adminId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    console.error('[AdminPaymentReview] Failed to fetch payment:', error)
    return errorResponse('Failed to fetch payment', 500)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdminWithId()

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(req)
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403)
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-payment-review' })
    if (!success) return rateLimitResponse(resetIn)

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

    // Atomic check-and-set inside transaction to prevent race conditions
    // Using updateMany with status: 'PENDING' ensures only one admin can process a payment
    const result = await prisma.$transaction(async (tx) => {
      // First get the payment to check existence and get userId/plan
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

      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

      // Atomic status update — only succeeds if still PENDING
      const updateResult = await tx.payment.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: newStatus,
          reviewedAt: now,
          adminNote: note || null,
        },
      })

      if (updateResult.count === 0) {
        throw new Error(`Payment has already been ${payment.status.toLowerCase()}`)
      }

      if (action === 'approve') {
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
            id: payment.id,
            status: newStatus,
            reviewedAt: now,
          },
        }
      } else {
        return {
          message: 'Payment rejected.',
          payment: {
            id: payment.id,
            status: newStatus,
            reviewedAt: now,
            adminNote: note || null,
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
      return errorResponse(error.message, 409)
    }
    console.error('[AdminPaymentReview] Failed to review payment:', error)
    return errorResponse('Failed to review payment', 500)
  }
}
