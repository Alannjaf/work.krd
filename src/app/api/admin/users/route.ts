import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { UserWithSubscription } from '@/types/api'
import { successResponse, forbiddenResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count()
    ])

    const usersWithRole = users.map((user: UserWithSubscription) => ({
      ...user,
      role: user.role || 'USER',
      subscription: user.subscription ? {
        ...user.subscription,
        resumeCount: user._count?.resumes || 0
      } : null
    }))

    return successResponse({
      users: usersWithRole,
      total,
      page,
      limit
    })
  } catch (error) {
    console.error('[AdminUsers] Failed to fetch users:', error);
    return forbiddenResponse('Unauthorized or failed to fetch users')
  }
}
