import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/admin'
import { successResponse, errorResponse, authErrorResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'
import { sendCampaignEmail } from '@/lib/email/service'
import { scheduleNextWelcomeStep } from '@/lib/email/schedulers'
import { renderWelcomeEmail, type WelcomeVariant } from '@/lib/email/templates/welcome'
import { renderAbandonedEmail } from '@/lib/email/templates/abandoned'
import { renderReengagementEmail, type ReengagementVariant } from '@/lib/email/templates/reengagement'
import type { EmailCampaign } from '@prisma/client'

/** Max jobs to process per run (avoid timeout on serverless) */
const BATCH_SIZE = 20

/**
 * Verify the cron request has a valid CRON_SECRET bearer token.
 */
async function verifyCronAuth(): Promise<boolean> {
  if (!process.env.CRON_SECRET) {
    devError('[Cron] CRON_SECRET env var is not set — endpoint disabled')
    return false
  }
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

// ─── Template Renderers ─────────────────────────────────────────────

type Locale = 'en' | 'ar' | 'ckb'

function detectLocale(user: { emailPreferences?: unknown }): Locale {
  const prefs = user.emailPreferences as { locale?: string } | null
  const locale = prefs?.locale
  if (locale === 'ar' || locale === 'ckb') return locale
  return 'en'
}

function renderEmailForJob(
  campaign: EmailCampaign,
  metadata: Record<string, unknown>,
  user: { id: string; name: string | null; email: string; emailPreferences?: unknown }
): { subject: string; html: string } | null {
  const locale = detectLocale(user)

  switch (campaign) {
    case 'WELCOME': {
      const key = (metadata.key as string) || 'day0'
      return renderWelcomeEmail({
        locale,
        variant: key as WelcomeVariant,
        userId: user.id,
        name: user.name || '',
      })
    }
    case 'ABANDONED_RESUME': {
      return renderAbandonedEmail({
        locale,
        userId: user.id,
        name: user.name || '',
        resumeId: (metadata.resumeId as string) || '',
        resumeTitle: (metadata.resumeTitle as string) || 'Untitled',
        completionPercent: (metadata.completionPercent as number) || 0,
        lastEdited: (metadata.lastEdited as string) || '',
      })
    }
    case 'RE_ENGAGEMENT': {
      const threshold = (metadata.threshold as number) || 30
      const variant: ReengagementVariant =
        threshold >= 90 ? '90d' : threshold >= 60 ? '60d' : '30d'
      return renderReengagementEmail({
        locale,
        variant,
        userId: user.id,
        name: user.name || '',
      })
    }
    default:
      return null
  }
}

// ─── Core Processing ────────────────────────────────────────────────

async function processEmailJobs(): Promise<{
  processed: number
  sent: number
  failed: number
  skipped: number
}> {
  const now = new Date()

  // Fetch PENDING jobs whose scheduledAt is in the past (ready to send)
  const jobs = await prisma.emailJob.findMany({
    where: {
      status: 'PENDING',
      scheduledAt: { lte: now },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          emailOptOut: true,
          emailPreferences: true,
          createdAt: true,
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
    take: BATCH_SIZE,
  })

  if (jobs.length === 0) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0 }
  }

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const job of jobs) {
    try {
      // Mark as PROCESSING to prevent re-pickup
      await prisma.emailJob.update({
        where: { id: job.id },
        data: { status: 'PROCESSING' },
      })

      // Skip if user opted out since job was created
      if (job.user.emailOptOut) {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: 'CANCELLED' },
        })
        skipped++
        continue
      }

      const metadata = (job.metadata as Record<string, unknown>) || {}

      // Render the email
      const rendered = renderEmailForJob(job.campaign, metadata, job.user)
      if (!rendered) {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: 'FAILED', error: 'Failed to render email template' },
        })
        failed++
        continue
      }

      // Send via service
      const result = await sendCampaignEmail({
        userId: job.user.id,
        to: job.user.email,
        subject: rendered.subject,
        html: rendered.html,
        campaign: job.campaign,
        emailJobId: job.id,
      })

      if (result.skipped) {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: 'CANCELLED' },
        })
        skipped++
        continue
      }

      if (!result.success) {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: 'FAILED', error: result.error || 'Send failed' },
        })
        failed++
        continue
      }

      // Mark as SENT
      await prisma.emailJob.update({
        where: { id: job.id },
        data: { status: 'SENT', sentAt: new Date() },
      })
      sent++

      // For welcome series, schedule the next step
      if (job.campaign === 'WELCOME') {
        const step = (metadata.step as number) ?? 0
        await scheduleNextWelcomeStep(job.user.id, step, job.user.createdAt)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      devError(`[Cron] Failed to process job ${job.id}:`, err)

      try {
        await prisma.emailJob.update({
          where: { id: job.id },
          data: { status: 'FAILED', error: message },
        })
      } catch {
        // Swallow update failure — job will be retried
      }

      failed++
    }
  }

  // Log as system cron action
  await logAdminAction('system:cron', 'PROCESS_EMAILS', 'email_jobs', {
    processed: jobs.length,
    sent,
    failed,
    skipped,
  })

  return { processed: jobs.length, sent, failed, skipped }
}

// GET — called by Netlify scheduled function (every 15 minutes)
export async function GET() {
  try {
    if (!process.env.CRON_SECRET) {
      devError('[Cron] CRON_SECRET env var is not set — endpoint disabled')
      return errorResponse('Cron endpoint not configured', 503)
    }

    const authorized = await verifyCronAuth()
    if (!authorized) {
      return authErrorResponse()
    }

    const result = await processEmailJobs()

    return successResponse({
      success: true,
      message: result.processed > 0
        ? `Processed ${result.processed} email jobs: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped`
        : 'No pending email jobs',
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    devError('[Cron] process-emails failed:', error)
    return errorResponse('Cron job failed', 500)
  }
}
