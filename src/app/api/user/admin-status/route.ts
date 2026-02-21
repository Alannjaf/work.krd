import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { DatabaseQueryResult } from '@/types/api'
import { successResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return successResponse({ isAdmin: false })
    }

    // Try to get user with role, fallback to checking if column exists
    try {
      const user = await prisma.$queryRaw`
        SELECT "role" FROM "User" 
        WHERE "clerkId" = ${userId}
        LIMIT 1
      ` as DatabaseQueryResult[]

      const response = successResponse({
        isAdmin: user?.[0]?.role === 'ADMIN'
      })
      response.headers.set('Cache-Control', 'private, max-age=30')
      return response
    } catch (error) {
      console.error('[AdminStatus] Failed to query user role:', error);
      // Role column might not exist yet
      return successResponse({ isAdmin: false })
    }
  } catch (error) {
    console.error('[AdminStatus] Failed to check admin status:', error);
    return successResponse({ isAdmin: false })
  }
}