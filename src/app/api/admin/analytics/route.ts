import { NextRequest } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 20, windowSeconds: 60, identifier: 'admin-analytics' })
    if (!success) return rateLimitResponse(resetIn)

    // Get data for last 12 months
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    // 1. Signups per month
    const signups = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    ` as { month: string; count: number }[]

    // 2. Monthly revenue (approved payments)
    const revenue = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "reviewedAt"), 'YYYY-MM') as month,
        SUM(amount)::int as amount,
        COUNT(*)::int as count
      FROM "Payment"
      WHERE status = 'APPROVED' AND "reviewedAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "reviewedAt")
      ORDER BY month
    ` as { month: string; amount: number; count: number }[]

    // 3. Active users per month (users who created or updated a resume)
    const activeUsers = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "updatedAt"), 'YYYY-MM') as month,
        COUNT(DISTINCT "userId")::int as count
      FROM "Resume"
      WHERE "updatedAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "updatedAt")
      ORDER BY month
    ` as { month: string; count: number }[]

    // 4. Resumes created per month
    const resumeCompletions = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "Resume"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    ` as { month: string; count: number }[]

    // Fill in missing months with 0s
    const months: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(d.toISOString().slice(0, 7))
    }

    const fillMonths = (data: { month: string; count?: number; amount?: number }[], key: 'count' | 'amount' = 'count') => {
      const map = new Map(data.map(d => [d.month, d]))
      return months.map(month => ({
        month,
        [key]: map.get(month)?.[key] ?? 0,
        ...(key === 'amount' ? { count: (map.get(month) as any)?.count ?? 0 } : {})
      }))
    }

    return successResponse({
      signups: fillMonths(signups),
      revenue: fillMonths(revenue, 'amount'),
      activeUsers: fillMonths(activeUsers),
      resumeCompletions: fillMonths(resumeCompletions),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return forbiddenResponse('Unauthorized')
    }
    return errorResponse('Failed to load analytics', 500)
  }
}
