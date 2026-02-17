/**
 * Abandoned resume detector.
 *
 * Finds users who started a resume (DRAFT status) but haven't touched it
 * in 24–48 hours. Excludes users who already have a PENDING or recent SENT
 * abandoned-resume email, and users who opted out of emails.
 *
 * Called by the cron job to schedule ABANDONED_RESUME email jobs.
 */

import { prisma } from '@/lib/prisma'
import type { EmailCampaign } from '@prisma/client'

const CAMPAIGN: EmailCampaign = 'ABANDONED_RESUME'

/** Window boundaries (in hours) */
const MIN_ABANDONED_HOURS = 24
const MAX_ABANDONED_HOURS = 48

interface AbandonedResume {
  userId: string
  userEmail: string
  userName: string | null
  resumeId: string
  resumeTitle: string
  lastUpdated: Date
}

/**
 * Find users with abandoned DRAFT resumes (updated 24–48h ago).
 * Excludes:
 *   - Users who opted out of emails
 *   - Users who already have a PENDING or PROCESSING abandoned-resume job
 *   - Users who received an abandoned-resume email in the last 7 days
 *
 * @returns Array of abandoned resume records with user info
 */
export async function findAbandonedResumes(): Promise<AbandonedResume[]> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - MAX_ABANDONED_HOURS * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() - MIN_ABANDONED_HOURS * 60 * 60 * 1000)
  const recentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Find DRAFT resumes updated within the 24-48h window,
  // where the user hasn't opted out and doesn't already have a pending/recent reminder
  const resumes = await prisma.resume.findMany({
    where: {
      status: 'DRAFT',
      updatedAt: {
        gte: windowStart,
        lte: windowEnd,
      },
      user: {
        emailOptOut: false,
        // Exclude users who already have a pending/processing abandoned job
        emailJobs: {
          none: {
            campaign: CAMPAIGN,
            OR: [
              { status: { in: ['PENDING', 'PROCESSING'] } },
              { status: 'SENT', sentAt: { gte: recentCutoff } },
            ],
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    // One reminder per user — take the most recently updated resume
    orderBy: { updatedAt: 'desc' },
  })

  // Deduplicate by userId — only keep the most recent resume per user
  const seen = new Set<string>()
  const results: AbandonedResume[] = []

  for (const resume of resumes) {
    if (seen.has(resume.userId)) continue
    seen.add(resume.userId)

    results.push({
      userId: resume.user.id,
      userEmail: resume.user.email,
      userName: resume.user.name,
      resumeId: resume.id,
      resumeTitle: resume.title,
      lastUpdated: resume.updatedAt,
    })
  }

  return results
}

/**
 * Schedule an abandoned-resume email job for a user.
 * Uses upsert — safe to call multiple times for the same user.
 *
 * @param userId - Internal DB user ID
 * @param resumeId - The abandoned resume ID (stored in metadata)
 * @param resumeTitle - The abandoned resume title (stored in metadata)
 * @returns The created/existing EmailJob
 */
export async function scheduleAbandonedResumeEmail(
  userId: string,
  resumeId: string,
  resumeTitle: string
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
        resumeId,
        resumeTitle,
      },
    },
  })

  return job
}
