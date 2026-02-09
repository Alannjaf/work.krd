import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, forbiddenResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    await requireAdmin()

    // Get statistics
    const [totalUsers, totalResumes, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      })
    ])

    // Calculate revenue based on current IQD pricing
    const basicSubs = await prisma.subscription.count({
      where: { status: 'ACTIVE', plan: 'BASIC' }
    })
    const proSubs = await prisma.subscription.count({
      where: { status: 'ACTIVE', plan: 'PRO' }
    })
    
    // Revenue in IQD (Basic: 5,000 IQD, Pro: 10,000 IQD)
    const revenueIQD = (basicSubs * 5000) + (proSubs * 10000)

    return successResponse({
      totalUsers,
      totalResumes,
      activeSubscriptions,
      revenue: revenueIQD,
      breakdown: {
        basicSubscriptions: basicSubs,
        proSubscriptions: proSubs,
        freeUsers: totalUsers - activeSubscriptions
      }
    })
  } catch (error) {
    console.error('[AdminStats] Failed to fetch stats:', error);
    return forbiddenResponse('Unauthorized or failed to fetch stats')
  }
}