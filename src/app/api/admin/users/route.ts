import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { UserWithSubscription } from '@/types/api'

export async function GET() {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
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
      }
    })

    // Handle users that might not have role column yet and update resume count
    const usersWithRole = users.map((user: UserWithSubscription) => ({
      ...user,
      role: user.role || 'USER',
      subscription: user.subscription ? {
        ...user.subscription,
        resumeCount: user._count?.resumes || 0
      } : null
    }))

    return NextResponse.json({ users: usersWithRole })
  } catch (error) {
    console.error('[AdminUsers] Failed to fetch users:', error);
    return NextResponse.json({
      error: 'Unauthorized or failed to fetch users'
    }, { status: 403 })
  }
}