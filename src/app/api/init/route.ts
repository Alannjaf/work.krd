import { initializeDatabase } from '@/lib/init-db'
import { requireAdminWithId } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    await requireAdminWithId()
    await initializeDatabase()
    return successResponse({ success: true, message: 'Database initialized' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403)
    }
    console.error('[Init] Failed to initialize database:', error);
    return errorResponse('Failed to initialize database', 500)
  }
}