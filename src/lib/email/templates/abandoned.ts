/**
 * Abandoned resume email template.
 *
 * Sent when a user starts a resume but doesn't complete it
 * within a configured time window. Includes resume info and
 * a direct link back to the builder.
 */

import { wrapInLayout, ctaButton, featureList, escapeHtml } from './layout'
import { getEmailTranslation, isRTLLocale } from '../i18n'
import { buildUnsubscribeUrl } from '../service'

type Locale = 'en' | 'ar' | 'ckb'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://work.krd'

interface AbandonedEmailParams {
  locale: Locale
  userId: string
  name: string
  resumeId: string
  resumeTitle: string
  /** Completion percentage (0-100) */
  completionPercent: number
  /** Last edited date string (formatted for display) */
  lastEdited: string
}

interface RenderedEmail {
  subject: string
  html: string
}

export function renderAbandonedEmail({
  locale,
  userId,
  name,
  resumeId,
  resumeTitle,
  completionPercent,
  lastEdited,
}: AbandonedEmailParams): RenderedEmail {
  const t = getEmailTranslation(locale)
  const isRTL = isRTLLocale(locale)
  const unsubscribeUrl = buildUnsubscribeUrl(userId)
  const safeName = escapeHtml(name || '')
  const safeTitle = escapeHtml(resumeTitle || '')

  const prefix = 'abandoned'
  const subject = t(`${prefix}.subject`)

  const tips = [
    t(`${prefix}.tips.t1`),
    t(`${prefix}.tips.t2`),
    t(`${prefix}.tips.t3`),
  ]

  // Progress bar color based on completion
  const progressColor = completionPercent >= 70 ? '#10b981' : completionPercent >= 40 ? '#f59e0b' : '#ef4444'

  const body = `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name: safeName })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <p style="margin: 0 0 20px;">${t(`${prefix}.body2`)}</p>

    <!-- Resume info card -->
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
      <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">${t(`${prefix}.resumeInfo.title`, { resumeTitle: safeTitle })}</p>
      <!-- Progress bar -->
      <div style="background: #e5e7eb; border-radius: 999px; height: 8px; margin: 12px 0;">
        <div style="background: ${progressColor}; border-radius: 999px; height: 8px; width: ${Math.min(completionPercent, 100)}%;"></div>
      </div>
      <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">${t(`${prefix}.resumeInfo.completion`, { percent: completionPercent })}</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #9ca3af;">${t(`${prefix}.resumeInfo.lastEdited`, { date: lastEdited })}</p>
    </div>

    <p style="margin: 0 0 24px;">${t(`${prefix}.body3`)}</p>

    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/resume-builder?id=${encodeURIComponent(resumeId)}`)}
    </div>

    <!-- Tips section -->
    <div style="background: #eff6ff; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #1e40af;">${t(`${prefix}.tips.title`)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        ${featureList(tips, isRTL)}
      </table>
    </div>

    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; font-style: italic;">${t(`${prefix}.closing`)}</p>
  `

  const html = wrapInLayout({
    locale,
    body,
    preheader: t(`${prefix}.preheader`),
    unsubscribeUrl,
  })

  return { subject, html }
}
