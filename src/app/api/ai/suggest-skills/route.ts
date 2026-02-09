import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AIService } from '@/lib/ai'
import { getCurrentUser, checkUserLimits } from '@/lib/db'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { success, resetIn } = rateLimit(req, {
    maxRequests: 30,
    windowSeconds: 60,
    identifier: 'ai',
  });
  if (!success) return rateLimitResponse(resetIn);

  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check AI usage limits using Clerk ID
    const limits = await checkUserLimits(userId)
    if (!limits.canUseAI) {
      return NextResponse.json({ 
        error: 'AI usage limit reached. Please upgrade your plan.' 
      }, { status: 403 })
    }

    if (!limits.subscription) {
      return NextResponse.json({ 
        error: 'User subscription not found.' 
      }, { status: 404 })
    }

    const body = await req.json()
    const { jobTitle, industry, language } = body

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }

    const skills = await AIService.generateSkillSuggestions(
      jobTitle,
      industry || '',
      { language: language || 'en' }
    )

    // Update AI usage count using subscription ID
    const { prisma } = await import('@/lib/prisma')
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { aiUsageCount: { increment: 1 } }
    })

    return NextResponse.json({ skills })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate skill suggestions' 
    }, { status: 500 })
  }
}