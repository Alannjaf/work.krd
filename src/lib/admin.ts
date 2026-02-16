import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
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

/**
 * Log an admin action to the audit trail.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  target: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        target,
        details: details ? (details as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    })
  } catch (error) {
    // devError not used here to avoid circular dependency with admin-utils
    if (process.env.NODE_ENV !== 'production') {
      console.error('[AuditLog] Failed to log admin action:', error)
    }
  }
}