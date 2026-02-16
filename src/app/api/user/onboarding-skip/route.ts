import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return authErrorResponse()
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return notFoundResponse('User not found')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true }
    })

    return successResponse({ success: true })
  } catch (error) {
    devError('[OnboardingSkip] Failed to skip onboarding:', error)
    return errorResponse('Internal server error', 500)
  }
}
