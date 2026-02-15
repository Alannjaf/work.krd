import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
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
  } catch {
    return NextResponse.json({ resumeCount: 0, userCount: 0 }, { status: 500 })
  }
}
