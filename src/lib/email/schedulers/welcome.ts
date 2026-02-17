/**
 * Welcome email series scheduler.
 *
 * The welcome series has 4 steps (Day 0, 2, 7, 14). Because the EmailJob table
 * has a unique constraint on (userId, campaign, status), only one PENDING job
 * per campaign per user can exist at a time. The series works as a chain:
 *
 *   1. scheduleWelcomeSeries() creates the Day 0 PENDING job
 *   2. The cron processor sends it and marks it SENT
 *   3. The processor calls scheduleNextWelcomeStep() to create Day 2
 *   4. Repeat until all 4 steps are sent
 *
 * Both functions use upsert for idempotency — safe to call multiple times.
 */

import { prisma } from '@/lib/prisma'
import type { EmailCampaign } from '@prisma/client'

/** Welcome series steps in order */
export const WELCOME_STEPS = [
  { step: 0, key: 'day0', dayOffset: 0 },
  { step: 1, key: 'day2', dayOffset: 2 },
  { step: 2, key: 'day7', dayOffset: 7 },
  { step: 3, key: 'day14', dayOffset: 14 },
] as const

export type WelcomeStep = (typeof WELCOME_STEPS)[number]

const CAMPAIGN: EmailCampaign = 'WELCOME'

/**
 * Schedule the first welcome email (Day 0) for a new user.
 * Safe to call multiple times — upsert ensures only one PENDING job exists.
 *
 * @param userId - Internal DB user ID (not Clerk ID)
 * @returns The created/existing EmailJob, or null if user opted out
 */
export async function scheduleWelcomeSeries(userId: string) {
  // Check opt-out before scheduling
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailOptOut: true },
  })

  if (!user || user.emailOptOut) {
    return null
  }

  const firstStep = WELCOME_STEPS[0]

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
      scheduledAt: new Date(), // Day 0 = now
      metadata: {
        step: firstStep.step,
        key: firstStep.key,
        dayOffset: firstStep.dayOffset,
        totalSteps: WELCOME_STEPS.length,
      },
    },
  })

  return job
}

/**
 * Schedule the next welcome step after a previous step was sent.
 * Called by the cron processor after marking the current step as SENT.
 *
 * @param userId - Internal DB user ID
 * @param completedStep - The step number that was just sent (0-3)
 * @param signupDate - Original signup date (to calculate correct scheduledAt)
 * @returns The next EmailJob, or null if series is complete or user opted out
 */
export async function scheduleNextWelcomeStep(
  userId: string,
  completedStep: number,
  signupDate: Date
) {
  const nextStepIndex = completedStep + 1

  // Series complete — no more steps
  if (nextStepIndex >= WELCOME_STEPS.length) {
    return null
  }

  // Re-check opt-out
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailOptOut: true },
  })

  if (!user || user.emailOptOut) {
    return null
  }

  const nextStep = WELCOME_STEPS[nextStepIndex]
  const scheduledAt = new Date(signupDate)
  scheduledAt.setDate(scheduledAt.getDate() + nextStep.dayOffset)

  // If the scheduled time is in the past (e.g., processing was delayed),
  // schedule for now so it goes out on the next processing cycle
  const now = new Date()
  if (scheduledAt < now) {
    scheduledAt.setTime(now.getTime())
  }

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
      scheduledAt,
      metadata: {
        step: nextStep.step,
        key: nextStep.key,
        dayOffset: nextStep.dayOffset,
        totalSteps: WELCOME_STEPS.length,
      },
    },
  })

  return job
}

/**
 * Cancel any pending welcome emails for a user (e.g., if they opt out).
 */
export async function cancelWelcomeSeries(userId: string) {
  const result = await prisma.emailJob.updateMany({
    where: {
      userId,
      campaign: CAMPAIGN,
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  })

  return result.count
}
