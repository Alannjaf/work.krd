import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, forbiddenResponse } from '@/lib/api-helpers'
import { getSystemSettings } from '@/lib/system-settings'

export async function GET() {
  try {
    await requireAdmin()

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

    return successResponse({
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
  } catch (error) {
    console.error('[AdminStats] Failed to fetch stats:', error);
    return forbiddenResponse('Unauthorized or failed to fetch stats')
  }
}
