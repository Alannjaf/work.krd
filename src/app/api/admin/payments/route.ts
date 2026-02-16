import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { errorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { attachCsrfToken } from '@/lib/csrf'
import { ADMIN_PAGINATION } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'] as const

export async function GET(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-payments' })
    if (!success) return rateLimitResponse(resetIn)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(ADMIN_PAGINATION.MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(ADMIN_PAGINATION.PAYMENTS), 10)))
    const skip = (page - 1) * limit

    // Validate status filter if provided
    if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return validationErrorResponse('Invalid status filter. Must be PENDING, APPROVED, REJECTED, or REFUNDED.')
    }

    const search = searchParams.get('search')?.trim()

    const where: Prisma.PaymentWhereInput = {}
    if (status) {
      where.status = status as typeof VALID_STATUSES[number]
    }
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          plan: true,
          amount: true,
          status: true,
          adminNote: true,
          createdAt: true,
          reviewedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    const response = NextResponse.json({
      payments,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    })

    return attachCsrfToken(response, adminId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    devError('[AdminPayments] Failed to fetch payments:', error)
    return errorResponse('Failed to fetch payments', 500)
  }
}
