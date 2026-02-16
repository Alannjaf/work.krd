import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { UserWithSubscription } from '@/types/api'
import { forbiddenResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { attachCsrfToken } from '@/lib/csrf'
import { Prisma } from '@prisma/client'
import { PLAN_NAMES, ADMIN_PAGINATION } from '@/lib/constants'

export async function GET(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-users' })
    if (!success) return rateLimitResponse(resetIn)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(ADMIN_PAGINATION.MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(ADMIN_PAGINATION.USERS))))
    const skip = (page - 1) * limit
    const search = searchParams.get('search')?.trim() || ''
    const plan = searchParams.get('plan') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // Build dynamic where clause
    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (plan === PLAN_NAMES.FREE || plan === PLAN_NAMES.PRO) {
      where.subscription = { plan }
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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          subscription: {
            select: {
              plan: true,
              status: true,
              resumeCount: true,
              aiUsageCount: true,
              exportCount: true,
              importCount: true,
              atsUsageCount: true
            }
          },
          _count: {
            select: {
              resumes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const usersWithRole = users.map((user: UserWithSubscription) => ({
      ...user,
      role: user.role || 'USER',
      subscription: user.subscription ? {
        ...user.subscription,
        resumeCount: user._count?.resumes || 0
      } : null
    }))

    const response = NextResponse.json({
      users: usersWithRole,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    })

    return attachCsrfToken(response, adminId)
  } catch (error) {
    console.error('[AdminUsers] Failed to fetch users:', error);
    return forbiddenResponse('Unauthorized or failed to fetch users')
  }
}
