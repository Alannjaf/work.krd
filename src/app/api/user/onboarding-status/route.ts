import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return authErrorResponse()
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    })

    // User not found — the Clerk webhook may not have fired yet
    if (!user) {
      return successResponse({
        onboardingCompleted: false,
        resumeCount: 0,
        userName: null,
        userNotFound: true
      })
    }

    return successResponse({
      onboardingCompleted: user.onboardingCompleted,
      resumeCount: user.subscription?.resumeCount ?? 0,
      userName: user.name
    })
  } catch (error) {
    devError('[OnboardingStatus] Failed to fetch:', error)
    return errorResponse('Internal server error', 500)
  }
}
