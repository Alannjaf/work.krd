import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AIService } from '@/lib/ai'
import { getCurrentUser, checkUserLimits } from '@/lib/db'
import { detectLanguage } from '@/lib/languageDetection'
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
    const { 
      content, 
      contentType, 
      sourceLanguage, 
      contextInfo 
    } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!contentType) {
      return NextResponse.json({ error: 'Content type is required' }, { status: 400 })
    }

    // Detect source language if not provided
    let detectedLanguage = sourceLanguage
    if (!detectedLanguage || detectedLanguage === 'auto') {
      const detected = detectLanguage(content)
      detectedLanguage = detected === 'en' ? 'auto' : detected
    }

    // Validate content type
    const validContentTypes = ['personal', 'summary', 'description', 'achievement', 'project']
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json({ 
        error: 'Invalid content type. Must be one of: ' + validContentTypes.join(', ') 
      }, { status: 400 })
    }

    const enhancedContent = await AIService.translateAndEnhance(
      content,
      contentType,
      detectedLanguage,
      contextInfo
    )

    // Update AI usage count using subscription ID
    const { prisma } = await import('@/lib/prisma')
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { aiUsageCount: { increment: 1 } }
    })

    return NextResponse.json({ 
      enhancedContent,
      detectedLanguage: detectedLanguage === 'auto' ? 'unknown' : detectedLanguage
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to translate and enhance content' 
    }, { status: 500 })
  }
}