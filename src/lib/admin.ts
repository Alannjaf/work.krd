import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  return user?.role === 'ADMIN'
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

/**
 * Like requireAdmin but returns the Clerk userId for use with CSRF tokens.
 */
export async function requireAdminWithId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized: Admin access required')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required')
  }

  return userId
}