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
    const { description, jobTitle, language } = body

    if (!description || !jobTitle) {
      return NextResponse.json({ error: 'Description and job title are required' }, { status: 400 })
    }

    const enhancedDescription = await AIService.enhanceJobDescription(
      description,
      jobTitle,
      { language: language || 'en' }
    )

    // Update AI usage count using subscription ID
    const { prisma } = await import('@/lib/prisma')
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { aiUsageCount: { increment: 1 } }
    })

    return NextResponse.json({ enhancedDescription })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to enhance description' 
    }, { status: 500 })
  }
}