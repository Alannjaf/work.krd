import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return authErrorResponse()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'referral-stats', userId: clerkId })
    if (!success) return rateLimitResponse(resetIn)

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        referralCode: true,
        referredBy: true,
        referralsMade: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            referred: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) return errorResponse('User not found', 404)

    const totalReferred = user.referralsMade.length
    const completed = user.referralsMade.filter(r => r.status === 'COMPLETED' || r.status === 'REWARDED').length
    const rewarded = user.referralsMade.filter(r => r.status === 'REWARDED').length

    return successResponse({
      referralCode: user.referralCode,
      referralLink: `https://work.krd?ref=${user.referralCode}`,
      isReferred: !!user.referredBy,
      stats: {
        totalReferred,
        completed,
        rewarded,
      },
      referrals: user.referralsMade.map(r => ({
        id: r.id,
        status: r.status,
        name: r.referred.name || 'Anonymous',
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('[Referral] Failed to fetch referral stats:', error)
    return errorResponse('Failed to fetch referral data', 500)
  }
}
