/**
 * Re-engagement email scheduler.
 *
 * Finds users who haven't logged in for a configurable period (30, 60, 90 days)
 * and schedules re-engagement emails. Excludes users who opted out or already
 * have a pending/recent re-engagement email.
 *
 * Called by the cron job to detect and schedule RE_ENGAGEMENT email jobs.
 */

import { prisma } from '@/lib/prisma'
import type { EmailCampaign } from '@prisma/client'

const CAMPAIGN: EmailCampaign = 'RE_ENGAGEMENT'

/** Inactivity thresholds in days, checked in order */
export const INACTIVITY_THRESHOLDS = [30, 60, 90] as const

export type InactivityThreshold = (typeof INACTIVITY_THRESHOLDS)[number]

interface InactiveUser {
  userId: string
  email: string
  name: string | null
  lastLoginAt: Date
  inactiveDays: number
  threshold: InactivityThreshold
}

/**
 * Find users who haven't logged in for longer than the given threshold.
 * Excludes:
 *   - Users who opted out of emails
 *   - Users who already have a PENDING or PROCESSING re-engagement job
 *   - Users who received a re-engagement email in the last 30 days
 *   - Users without a lastLoginAt (never tracked — skip for safety)
 *
 * @param threshold - Number of days of inactivity (30, 60, or 90)
 * @param limit - Max number of users to return (default 100, for batch processing)
 * @returns Array of inactive user records
 */
export async function findInactiveUsers(
  threshold: InactivityThreshold = 30,
  limit: number = 100
): Promise<InactiveUser[]> {
  const now = new Date()
  const cutoffDate = new Date(now.getTime() - threshold * 24 * 60 * 60 * 1000)
  const recentEmailCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const users = await prisma.user.findMany({
    where: {
      emailOptOut: false,
      lastLoginAt: {
        not: null,
        lte: cutoffDate,
      },
      // Exclude users with pending/processing or recently sent re-engagement emails
      emailJobs: {
        none: {
          campaign: CAMPAIGN,
          OR: [
            { status: { in: ['PENDING', 'PROCESSING'] } },
            { status: 'SENT', sentAt: { gte: recentEmailCutoff } },
          ],
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      lastLoginAt: true,
    },
    orderBy: { lastLoginAt: 'asc' }, // Most inactive first
    take: limit,
  })

  return users
    .filter((u): u is typeof u & { lastLoginAt: Date } => u.lastLoginAt !== null)
    .map((user) => {
      const inactiveDays = Math.floor(
        (now.getTime() - user.lastLoginAt.getTime()) / (24 * 60 * 60 * 1000)
      )

      // Determine which threshold bucket this user falls into
      const matchedThreshold = [...INACTIVITY_THRESHOLDS]
        .reverse()
        .find((t) => inactiveDays >= t) ?? threshold

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        lastLoginAt: user.lastLoginAt,
        inactiveDays,
        threshold: matchedThreshold as InactivityThreshold,
      }
    })
}

/**
 * Schedule a re-engagement email job for a user.
 * Uses upsert — safe to call multiple times for the same user.
 *
 * @param userId - Internal DB user ID
 * @param threshold - The inactivity threshold that triggered this
 * @param inactiveDays - Actual number of days inactive
 * @returns The created/existing EmailJob
 */
export async function scheduleReengagementEmail(
  userId: string,
  threshold: InactivityThreshold,
  inactiveDays: number
) {
  const job = await prisma.emailJob.upsert({
    where: {
      unique_pending_campaign: {
        userId,
        campaign: CAMPAIGN,
        status: 'PENDING',
      },
    },
    update: {}, // Already exists — no-op
    create: {
      userId,
      campaign: CAMPAIGN,
      status: 'PENDING',
      scheduledAt: new Date(), // Send on next processing cycle
      metadata: {
        threshold,
        inactiveDays,
      },
    },
  })

  return job
}
