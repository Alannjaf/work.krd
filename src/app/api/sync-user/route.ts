import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, validationErrorResponse } from '@/lib/api-helpers'

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
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null},
      create: {
        clerkId: userId,
        email,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null}})

    // Check if user has a subscription, if not create a free one
    const _subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }})

    if (!_subscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREE',
          status: 'ACTIVE'}})
    }

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