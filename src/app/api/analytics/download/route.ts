import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkUserLimits } from '@/lib/db'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check export limits before allowing download
    const limits = await checkUserLimits(userId)
    
    if (!limits.canExport) {
      return NextResponse.json({ 
        error: 'Export limit reached. Please upgrade your plan.' 
      }, { status: 403 })
    }

    if (!limits.subscription) {
      return NextResponse.json({ 
        error: 'User subscription not found.' 
      }, { status: 404 })
    }

    const { template } = await request.json()

    // Check if user can use the selected template
    if (!limits.availableTemplates?.includes(template)) {
      return NextResponse.json({ 
        error: `Template "${template}" is not available for your ${limits.subscription.plan} plan. Available templates: ${limits.availableTemplates?.join(', ') || 'none'}`,
        template,
        availableTemplates: limits.availableTemplates
      }, { status: 403 })
    }

    // Update export count in database using the subscription ID from the limits check
    await prisma.subscription.update({
      where: { id: limits.subscription.id },
      data: { exportCount: { increment: 1 } }
    })

    // Log download event (removed console.log)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AnalyticsDownload] Failed to track download:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}