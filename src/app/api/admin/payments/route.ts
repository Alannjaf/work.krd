import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // Validate status filter if provided
    if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return validationErrorResponse('Invalid status filter. Must be PENDING, APPROVED, or REJECTED.')
    }

    const where = status ? { status: status as typeof VALID_STATUSES[number] } : {}

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

    return successResponse({
      payments,
      total,
      page,
      limit,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    console.error('[AdminPayments] Failed to fetch payments:', error)
    return errorResponse('Failed to fetch payments', 500)
  }
}
