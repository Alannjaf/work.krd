import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkUserLimits } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const limits = await checkUserLimits(userId)
    
    return NextResponse.json({
      canCreateResume: limits.canCreateResume,
      canUseAI: limits.canUseAI,
      canExport: limits.canExport,
      canImport: limits.canImport,
      canUploadPhoto: limits.canUploadPhoto,
      canUseATS: limits.canUseATS,
      availableTemplates: limits.availableTemplates,
      canAccessProTemplates: (limits.availableTemplates?.length ?? 0) > 2, // More than basic templates
      canExportToPDF: limits.canExport
    })
  } catch (error) {
    console.error('[Permissions] Failed to fetch permissions:', error);
    return NextResponse.json({
      error: 'Failed to fetch permissions'
    }, { status: 500 })
  }
}