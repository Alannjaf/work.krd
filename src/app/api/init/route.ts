import { initializeDatabase } from '@/lib/init-db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    await initializeDatabase()
    return successResponse({ success: true, message: 'Database initialized' })
  } catch (error) {
    console.error('[Init] Failed to initialize database:', error);
    return errorResponse('Failed to initialize database', 500)
  }
}