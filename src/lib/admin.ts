import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false

  const user = await prisma.$queryRaw`
    SELECT "role" FROM "User"
    WHERE "clerkId" = ${userId}
    LIMIT 1
  ` as { role: string }[]

  return user?.[0]?.role === 'ADMIN'
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}