import { NextRequest } from 'next/server'
import { requireAdminWithId } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    await requireAdminWithId()

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'admin-audit-log' })
    if (!success) return rateLimitResponse(resetIn)

    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return Response.json({ logs })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    console.error('[AuditLog] Failed to fetch audit logs:', error)
    return errorResponse('Failed to fetch audit logs', 500)
  }
}
