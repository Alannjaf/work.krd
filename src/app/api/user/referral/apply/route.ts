import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return authErrorResponse()

    const { success, resetIn } = rateLimit(req, { maxRequests: 5, windowSeconds: 60, identifier: 'referral-apply', userId: clerkId })
    if (!success) return rateLimitResponse(resetIn)

    let body: { code?: string }
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse('Invalid request body')
    }

    const { code } = body
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return validationErrorResponse('Referral code is required')
    }

    const normalizedCode = code.trim().toUpperCase()

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, referredBy: true, referralCode: true },
    })

    if (!currentUser) return errorResponse('User not found', 404)

    // Can't apply if already referred
    if (currentUser.referredBy) {
      return validationErrorResponse('You have already used a referral code')
    }

    // Can't use own code
    if (currentUser.referralCode === normalizedCode) {
      return validationErrorResponse('You cannot use your own referral code')
    }

    // Find referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: normalizedCode },
      select: { id: true },
    })

    if (!referrer) {
      return validationErrorResponse('Invalid referral code')
    }

    // Apply referral atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: currentUser.id },
        data: { referredBy: normalizedCode },
      }),
      prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: currentUser.id,
          referralCode: normalizedCode,
          status: 'PENDING',
        },
      }),
    ])

    return successResponse({ success: true, message: 'Referral code applied successfully' })
  } catch (error) {
    // Handle unique constraint violation (referral already exists)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return validationErrorResponse('This referral has already been applied')
    }
    console.error('[Referral] Failed to apply referral code:', error)
    return errorResponse('Failed to apply referral code', 500)
  }
}
