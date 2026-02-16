import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { forbiddenResponse } from '@/lib/api-helpers'
import { getSystemSettings } from '@/lib/system-settings'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { attachCsrfToken } from '@/lib/csrf'

export async function GET(req: NextRequest) {
  try {
    const adminId = await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-stats' })
    if (!success) return rateLimitResponse(resetIn)

    const [totalUsers, totalResumes, activeSubscriptions, pendingPayments, approvedPayments, rejectedPayments, settings] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE', plan: 'PRO' }
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'APPROVED' } }),
      prisma.payment.count({ where: { status: 'REJECTED' } }),
      getSystemSettings()
    ])

    // Revenue in IQD (Pro plan price from system settings)
    const revenueIQD = activeSubscriptions * (settings?.proPlanPrice || 5000)

    const response = NextResponse.json({
      totalUsers,
      totalResumes,
      activeSubscriptions,
      revenue: revenueIQD,
      payments: {
        pending: pendingPayments,
        approved: approvedPayments,
        rejected: rejectedPayments
      }
    })

    return attachCsrfToken(response, adminId)
  } catch (error) {
    console.error('[AdminStats] Failed to fetch stats:', error);
    return forbiddenResponse('Unauthorized or failed to fetch stats')
  }
}
