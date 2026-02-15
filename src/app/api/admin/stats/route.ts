import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, forbiddenResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    await requireAdmin()

    const [totalUsers, totalResumes, activeSubscriptions, pendingPayments, approvedPayments, rejectedPayments] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE', plan: 'PRO' }
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'APPROVED' } }),
      prisma.payment.count({ where: { status: 'REJECTED' } })
    ])

    // Revenue in IQD (Pro: 5,000 IQD)
    const revenueIQD = activeSubscriptions * 5000

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
