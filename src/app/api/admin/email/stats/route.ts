import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { errorResponse, forbiddenResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { attachCsrfToken } from '@/lib/csrf'
import { devError } from '@/lib/admin-utils'

export async function GET(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 20, windowSeconds: 60, identifier: 'admin-email-stats' })
    if (!success) return rateLimitResponse(resetIn)

    // Aggregate all stats in parallel
    const [
      jobsByStatus,
      jobsByCampaign,
      logsByStatus,
      recentLogs,
      dailySentCounts,
    ] = await Promise.all([
      // EmailJob counts by status
      prisma.emailJob.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // EmailJob counts by campaign
      prisma.emailJob.groupBy({
        by: ['campaign'],
        _count: { id: true },
      }),
      // EmailLog counts by delivery status
      prisma.emailLog.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Recent email logs (last 50)
      prisma.emailLog.findMany({
        select: {
          id: true,
          campaign: true,
          recipientEmail: true,
          subject: true,
          status: true,
          error: true,
          sentAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      // Daily sent counts for last 14 days
      prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') as date,
          COUNT(*)::int as count
        FROM "EmailLog"
        WHERE "createdAt" >= NOW() - INTERVAL '14 days'
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date
      ` as Promise<{ date: string; count: number }[]>,
    ])

    // Build status counts map
    const statusCounts: Record<string, number> = {}
    for (const row of jobsByStatus) {
      statusCounts[row.status] = row._count.id
    }

    // Build campaign counts map
    const campaignCounts: Record<string, number> = {}
    for (const row of jobsByCampaign) {
      campaignCounts[row.campaign] = row._count.id
    }

    // Build delivery status counts map
    const deliveryCounts: Record<string, number> = {}
    for (const row of logsByStatus) {
      deliveryCounts[row.status] = row._count.id
    }

    const totalSent = (deliveryCounts['SENT'] ?? 0) + (deliveryCounts['DELIVERED'] ?? 0) + (deliveryCounts['OPENED'] ?? 0)
    const totalPending = (statusCounts['PENDING'] ?? 0) + (statusCounts['PROCESSING'] ?? 0) + (deliveryCounts['QUEUED'] ?? 0)
    const totalFailed = (deliveryCounts['FAILED'] ?? 0) + (deliveryCounts['BOUNCED'] ?? 0) + (statusCounts['FAILED'] ?? 0)

    const response = NextResponse.json({
      overview: {
        totalSent,
        totalPending,
        totalFailed,
      },
      jobsByStatus: statusCounts,
      campaignCounts,
      deliveryCounts,
      recentLogs,
      dailySentCounts,
    })

    return attachCsrfToken(response, adminId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return forbiddenResponse('Unauthorized')
    }
    devError('[AdminEmailStats] Failed to fetch email stats:', error)
    return errorResponse('Failed to fetch email stats', 500)
  }
}
