/**
 * Email campaign service — core infrastructure for sending campaign emails.
 *
 * Provides:
 * - sendCampaignEmail(): Resend integration with opt-out checking + EmailLog creation
 * - HMAC token generation for secure unsubscribe links
 * - Opt-out checking before sending
 */

import { createHmac } from 'crypto'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { devError } from '@/lib/admin-utils'
import type { EmailCampaign, EmailDeliveryStatus } from '@prisma/client'

// Lazy init to avoid build-time errors when env var is absent
const getResend = () => new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Work.krd <noreply@work.krd>'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://work.krd'

// ─── HMAC Token for Unsubscribe Links ───────────────────────────────

function getEmailSecret(): string {
  // Use a dedicated secret or fall back to CLERK_SECRET_KEY (always available server-side)
  return process.env.EMAIL_HMAC_SECRET || process.env.CLERK_SECRET_KEY || 'fallback-dev-secret'
}

/**
 * Generate an HMAC token for a secure unsubscribe link.
 * Token format: userId.signature
 * No expiry — unsubscribe links should always work.
 */
export function generateUnsubscribeToken(userId: string): string {
  const signature = createHmac('sha256', getEmailSecret())
    .update(`unsubscribe:${userId}`)
    .digest('hex')
  return `${userId}.${signature}`
}

/**
 * Validate an HMAC unsubscribe token.
 * Returns the userId if valid, null otherwise.
 */
export function validateUnsubscribeToken(token: string): string | null {
  const dotIndex = token.indexOf('.')
  if (dotIndex === -1) return null

  const userId = token.slice(0, dotIndex)
  const signature = token.slice(dotIndex + 1)

  const expected = createHmac('sha256', getEmailSecret())
    .update(`unsubscribe:${userId}`)
    .digest('hex')

  // Constant-time comparison
  if (signature.length !== expected.length) return null
  let mismatch = 0
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }

  return mismatch === 0 ? userId : null
}

/**
 * Build the full unsubscribe URL for a user.
 */
export function buildUnsubscribeUrl(userId: string): string {
  const token = generateUnsubscribeToken(userId)
  return `${BASE_URL}/unsubscribe?token=${encodeURIComponent(token)}`
}

// ─── Opt-Out Check ──────────────────────────────────────────────────

/**
 * Check if a user has opted out of campaign emails.
 * Returns true if the user has opted out.
 */
async function isOptedOut(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailOptOut: true },
  })
  return user?.emailOptOut ?? true // Default to opted-out if user not found
}

// ─── Send Campaign Email ────────────────────────────────────────────

interface SendCampaignEmailParams {
  /** User DB id */
  userId: string
  /** Recipient email */
  to: string
  /** Email subject line */
  subject: string
  /** Full HTML body (already wrapped in layout) */
  html: string
  /** Campaign type for logging */
  campaign: EmailCampaign
  /** Optional EmailJob id to link the log entry */
  emailJobId?: string
  /** Optional plain text version */
  text?: string
}

interface SendResult {
  success: boolean
  /** Resend message ID on success */
  messageId?: string
  /** Error message on failure */
  error?: string
  /** Whether skipped due to opt-out */
  skipped?: boolean
}

/**
 * Send a campaign email with full pipeline:
 * 1. Check opt-out status
 * 2. Create EmailLog entry (QUEUED)
 * 3. Send via Resend
 * 4. Update EmailLog with result
 */
export async function sendCampaignEmail({
  userId,
  to,
  subject,
  html,
  campaign,
  emailJobId,
  text,
}: SendCampaignEmailParams): Promise<SendResult> {
  // 1. Check opt-out
  const optedOut = await isOptedOut(userId)
  if (optedOut) {
    return { success: false, skipped: true, error: 'User opted out' }
  }

  // 2. Create EmailLog entry
  const emailLog = await prisma.emailLog.create({
    data: {
      emailJobId: emailJobId ?? null,
      userId,
      campaign,
      recipientEmail: to,
      subject,
      status: 'QUEUED',
    },
  })

  // 3. Send via Resend
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      ...(text && { text }),
      headers: {
        'List-Unsubscribe': `<${buildUnsubscribeUrl(userId)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    if (error) {
      // 4a. Update log on Resend error
      await updateEmailLogStatus(emailLog.id, 'FAILED', error.message)
      devError('[Email] Resend API error:', error)
      return { success: false, error: error.message }
    }

    // 4b. Update log on success
    await updateEmailLogStatus(emailLog.id, 'SENT')

    return { success: true, messageId: data?.id }
  } catch (err) {
    // 4c. Update log on unexpected error
    const message = err instanceof Error ? err.message : 'Unknown error'
    await updateEmailLogStatus(emailLog.id, 'FAILED', message)
    devError('[Email] Failed to send campaign email:', err)
    return { success: false, error: message }
  }
}

/** Update an EmailLog entry's status and optional error message */
async function updateEmailLogStatus(
  logId: string,
  status: EmailDeliveryStatus,
  error?: string
): Promise<void> {
  try {
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status,
        ...(status === 'SENT' && { sentAt: new Date() }),
        ...(error && { error }),
      },
    })
  } catch (updateErr) {
    // Log but don't throw — the email was already sent/failed
    devError('[Email] Failed to update EmailLog:', updateErr)
  }
}
