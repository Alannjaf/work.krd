/**
 * Re-engagement email campaign templates — tiered by inactivity.
 *
 * 30 days: Gentle nudge to update resume
 * 60 days: Highlight new features/templates
 * 90 days: Fresh start encouragement
 */

import { wrapInLayout, ctaButton, featureList, escapeHtml } from './layout'
import { getEmailTranslation, isRTLLocale } from '../i18n'
import { buildUnsubscribeUrl } from '../service'

type Locale = 'en' | 'ar' | 'ckb'
export type ReengagementVariant = '30d' | '60d' | '90d'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://work.krd'

interface ReengagementEmailParams {
  locale: Locale
  variant: ReengagementVariant
  userId: string
  name: string
}

interface RenderedEmail {
  subject: string
  html: string
}

export function renderReengagementEmail({
  locale,
  variant,
  userId,
  name,
}: ReengagementEmailParams): RenderedEmail {
  const t = getEmailTranslation(locale)
  const isRTL = isRTLLocale(locale)
  const unsubscribeUrl = buildUnsubscribeUrl(userId)
  const safeName = escapeHtml(name || '')

  const prefix = `reengagement.${variant}`
  const subject = t(`${prefix}.subject`)

  let body: string

  switch (variant) {
    case '30d':
      body = render30d(t, prefix, safeName, isRTL)
      break
    case '60d':
      body = render60d(t, prefix, safeName, isRTL)
      break
    case '90d':
      body = render90d(t, prefix, safeName, isRTL)
      break
  }

  const html = wrapInLayout({
    locale,
    body,
    preheader: t(`${prefix}.preheader`),
    unsubscribeUrl,
  })

  return { subject, html }
}

function render30d(
  t: (key: string, vars?: Record<string, string | number>) => string,
  prefix: string,
  name: string,
  isRTL: boolean
): string {
  const reasons = [
    t(`${prefix}.reasons.r1`),
    t(`${prefix}.reasons.r2`),
    t(`${prefix}.reasons.r3`),
    t(`${prefix}.reasons.r4`),
  ]

  return `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body2`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
      ${featureList(reasons, isRTL)}
    </table>
    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/dashboard`)}
    </div>
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">${t(`${prefix}.closing`)}</p>
  `
}

function render60d(
  t: (key: string, vars?: Record<string, string | number>) => string,
  prefix: string,
  name: string,
  isRTL: boolean
): string {
  const updates = [
    t(`${prefix}.updates.u1`),
    t(`${prefix}.updates.u2`),
    t(`${prefix}.updates.u3`),
    t(`${prefix}.updates.u4`),
  ]

  return `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body2`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
      ${featureList(updates, isRTL)}
    </table>
    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/dashboard`)}
    </div>
    <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #166534;">${t(`${prefix}.offer`)}</p>
      ${ctaButton(t(`${prefix}.ctaSecondary`), `${BASE_URL}/dashboard`, true)}
    </div>
  `
}

function render90d(
  t: (key: string, vars?: Record<string, string | number>) => string,
  prefix: string,
  name: string,
  isRTL: boolean
): string {
  const actions = [
    t(`${prefix}.actions.a1`),
    t(`${prefix}.actions.a2`),
    t(`${prefix}.actions.a3`),
    t(`${prefix}.actions.a4`),
  ]

  return `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body2`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
      ${featureList(actions, isRTL)}
    </table>
    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/resume-builder`)}
    </div>
    <p style="margin: 16px 0;">${t(`${prefix}.body3`)}</p>
    <div style="text-align: center; margin: 16px 0;">
      ${ctaButton(t(`${prefix}.ctaSecondary`), `${BASE_URL}/dashboard`, true)}
    </div>
  `
}
