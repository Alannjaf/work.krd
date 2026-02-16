import { NextRequest } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { devError } from '@/lib/admin-utils'
import { Prisma } from '@prisma/client'
import { ADMIN_PAGINATION } from '@/lib/constants'

export async function GET(req: NextRequest) {
  try {
    await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-audit-log' })
    if (!success) return rateLimitResponse(resetIn)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(ADMIN_PAGINATION.MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(ADMIN_PAGINATION.AUDIT_LOGS))))
    const skip = (page - 1) * limit
    const action = searchParams.get('action') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // Build dynamic where clause
    const where: Prisma.AdminAuditLogWhereInput = {}

    if (action) {
      where.action = action
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // Include the entire end date day
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.adminAuditLog.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return Response.json({
      logs,
      total,
      page,
      totalPages,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    devError('[AuditLog] Failed to fetch audit logs:', error)
    return errorResponse('Failed to fetch audit logs', 500)
  }
}
