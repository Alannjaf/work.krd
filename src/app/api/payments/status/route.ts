import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return authErrorResponse()
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        plan: true,
        amount: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        adminNote: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ payments })
  } catch (error) {
    devError('[PaymentStatus] Failed to fetch payment status:', error)
    return errorResponse('Failed to fetch payment status', 500)
  }
}
