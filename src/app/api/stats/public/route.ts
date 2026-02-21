import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'stats-public' })
  if (!success) return rateLimitResponse(resetIn)

  try {
    const [resumeCount, userCount] = await Promise.all([
      prisma.resume.count(),
      prisma.user.count(),
    ])

    return NextResponse.json(
      { resumeCount, userCount },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[StatsPublic] Failed to fetch stats:', error)
    return NextResponse.json({ resumeCount: 0, userCount: 0 }, { status: 500 })
  }
}
