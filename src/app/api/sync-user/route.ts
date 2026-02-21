import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { PLAN_NAMES } from '@/lib/constants'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return authErrorResponse()
    }

    // Get user details from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return validationErrorResponse('Could not fetch user details')
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return validationErrorResponse('No email found')
    }

    // Upsert user in database
    let user
    try {
      user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {
          email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null},
        create: {
          clerkId: userId,
          email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null}})
    } catch (e: unknown) {
      // Handle email unique constraint conflict (e.g. same user, different Clerk env)
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        user = await prisma.user.update({
          where: { email },
          data: {
            clerkId: userId,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null}})
      } else {
        throw e
      }
    }

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        plan: PLAN_NAMES.FREE,
        status: 'ACTIVE',
      },
    })

    return successResponse({
      message: 'User synced successfully!',
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name}
    })
  } catch (error) {
    return errorResponse('Failed to sync user', 500)
  }
}