import { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { devError } from '@/lib/admin-utils'

const VALID_CAMPAIGNS = ['WELCOME', 'ABANDONED_RESUME', 'RE_ENGAGEMENT'] as const
type Campaign = typeof VALID_CAMPAIGNS[number]

function getUnsubscribeSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET env var is not set')
  return secret
}

/**
 * Verify and decode an unsubscribe token.
 * Returns { userId, campaign } if valid, null otherwise.
 */
function verifyUnsubscribeToken(token: string): { userId: string; campaign: Campaign } | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payload, signature] = parts

  // Verify HMAC signature
  const expected = createHmac('sha256', getUnsubscribeSecret()).update(payload).digest('hex')

  // Constant-time comparison
  if (signature.length !== expected.length) return null
  const sigBuf = Buffer.from(signature, 'utf8')
  const expBuf = Buffer.from(expected, 'utf8')
  if (!timingSafeEqual(sigBuf, expBuf)) return null

  // Decode payload
  let decoded: string
  try {
    decoded = Buffer.from(payload, 'base64').toString('utf8')
  } catch {
    return null
  }

  const colonIndex = decoded.indexOf(':')
  if (colonIndex === -1) return null

  const userId = decoded.slice(0, colonIndex)
  const campaign = decoded.slice(colonIndex + 1)

  if (!userId || !VALID_CAMPAIGNS.includes(campaign as Campaign)) return null

  return { userId, campaign: campaign as Campaign }
}

/**
 * POST /api/unsubscribe
 * Body: { token: string }
 * Verifies HMAC token, updates user emailPreferences, cancels pending EmailJobs.
 */
export async function POST(request: NextRequest) {
  const { success, resetIn } = rateLimit(request, {
    maxRequests: 20,
    windowSeconds: 900,
    identifier: 'unsubscribe',
  })
  if (!success) return rateLimitResponse(resetIn)

  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return validationErrorResponse('Invalid unsubscribe token')
    }

    const result = verifyUnsubscribeToken(token)
    if (!result) {
      return validationErrorResponse('Invalid or expired unsubscribe token')
    }

    const { userId, campaign } = result

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, emailPreferences: true },
    })

    if (!user) {
      // Don't reveal whether user exists — return success anyway
      return successResponse({ message: 'You have been unsubscribed successfully.' })
    }

    // Update emailPreferences — set campaign to false
    const currentPrefs = (user.emailPreferences as Record<string, boolean> | null) || {}
    const updatedPrefs = { ...currentPrefs, [campaign]: false }

    // Check if all campaigns are now opted out
    const allOptedOut = VALID_CAMPAIGNS.every(c => updatedPrefs[c] === false)

    // Update user preferences and cancel pending jobs in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          emailPreferences: updatedPrefs,
          emailOptOut: allOptedOut,
        },
      }),
      // Cancel all pending email jobs for this user+campaign
      prisma.emailJob.updateMany({
        where: {
          userId,
          campaign,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      }),
    ])

    return successResponse({ message: 'You have been unsubscribed successfully.' })
  } catch (error) {
    devError('[Unsubscribe] Failed to process unsubscribe:', error)
    return errorResponse('Failed to process unsubscribe request. Please try again.', 500)
  }
}

/**
 * GET /api/unsubscribe?token=xxx
 * Alternative: handle unsubscribe via GET for one-click unsubscribe (RFC 8058).
 */
export async function GET(request: NextRequest) {
  const { success, resetIn } = rateLimit(request, {
    maxRequests: 20,
    windowSeconds: 900,
    identifier: 'unsubscribe',
  })
  if (!success) return rateLimitResponse(resetIn)

  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return validationErrorResponse('Missing unsubscribe token')
    }

    const result = verifyUnsubscribeToken(token)
    if (!result) {
      return validationErrorResponse('Invalid or expired unsubscribe token')
    }

    const { userId, campaign } = result

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, emailPreferences: true },
    })

    if (!user) {
      return successResponse({ message: 'You have been unsubscribed successfully.' })
    }

    const currentPrefs = (user.emailPreferences as Record<string, boolean> | null) || {}
    const updatedPrefs = { ...currentPrefs, [campaign]: false }
    const allOptedOut = VALID_CAMPAIGNS.every(c => updatedPrefs[c] === false)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          emailPreferences: updatedPrefs,
          emailOptOut: allOptedOut,
        },
      }),
      prisma.emailJob.updateMany({
        where: {
          userId,
          campaign,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      }),
    ])

    return successResponse({ message: 'You have been unsubscribed successfully.' })
  } catch (error) {
    devError('[Unsubscribe] Failed to process unsubscribe:', error)
    return errorResponse('Failed to process unsubscribe request. Please try again.', 500)
  }
}
