import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin()
    
    const { userId } = await params
    const { plan } = await req.json()

    if (!['FREE', 'BASIC', 'PRO'].includes(plan)) {
      return validationErrorResponse('Invalid plan')
    }

    // Check if user has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { userId },
        data: {
          plan,
          status: 'ACTIVE',
          // Reset limits based on new plan
          resumeCount: 0,
          aiUsageCount: 0,
          exportCount: 0,
          startDate: new Date(),
          endDate: plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId,
          plan,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return successResponse({
      success: true,
      message: `User upgraded to ${plan} plan`
    })
  } catch (error) {
    console.error('[AdminUpgrade] Failed to upgrade user:', error);
    return errorResponse('Failed to upgrade user', 500)
  }
}