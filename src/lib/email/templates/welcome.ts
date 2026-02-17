/**
 * Welcome email campaign templates — drip sequence.
 *
 * Day 0: Welcome + account ready
 * Day 2: Template selection tip
 * Day 7: AI writing feature highlight
 * Day 14: ATS optimization + Pro upsell
 */

import { wrapInLayout, ctaButton, featureList, escapeHtml } from './layout'
import { getEmailTranslation, isRTLLocale } from '../i18n'
import { buildUnsubscribeUrl } from '../service'

type Locale = 'en' | 'ar' | 'ckb'
export type WelcomeVariant = 'day0' | 'day2' | 'day7' | 'day14'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://work.krd'

interface WelcomeEmailParams {
  locale: Locale
  variant: WelcomeVariant
  userId: string
  name: string
  /** AI credits remaining (for day7 variant) */
  aiCredits?: number
}

interface RenderedEmail {
  subject: string
  html: string
}

export function renderWelcomeEmail({
  locale,
  variant,
  userId,
  name,
  aiCredits,
}: WelcomeEmailParams): RenderedEmail {
  const t = getEmailTranslation(locale)
  const isRTL = isRTLLocale(locale)
  const unsubscribeUrl = buildUnsubscribeUrl(userId)
  const safeName = escapeHtml(name || '')

  const prefix = `welcome.${variant}`
  const subject = t(`${prefix}.subject`)

  let body: string

  switch (variant) {
    case 'day0':
      body = renderDay0(t, prefix, safeName, isRTL)
      break
    case 'day2':
      body = renderDay2(t, prefix, safeName, isRTL)
      break
    case 'day7':
      body = renderDay7(t, prefix, safeName, isRTL, aiCredits ?? 100)
      break
    case 'day14':
      body = renderDay14(t, prefix, safeName, isRTL)
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

function renderDay0(
  t: (key: string, vars?: Record<string, string | number>) => string,
  prefix: string,
  name: string,
  isRTL: boolean
): string {
  const features = [
    t(`${prefix}.features.f1`),
    t(`${prefix}.features.f2`),
    t(`${prefix}.features.f3`),
    t(`${prefix}.features.f4`),
  ]

  return `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body2`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
      ${featureList(features, isRTL)}
    </table>
    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/resume-builder`)}
    </div>
    <div style="text-align: center; margin: 16px 0;">
      ${ctaButton(t(`${prefix}.ctaSecondary`), `${BASE_URL}/resume-builder#templates`, true)}
    </div>
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">${t(`${prefix}.closing`)}</p>
  `
}

function renderDay2(
  t: (key: string, vars?: Record<string, string | number>) => string,
  prefix: string,
  name: string,
  isRTL: boolean
): string {
  const steps = [
    t(`${prefix}.steps.s1`),
    t(`${prefix}.steps.s2`),
    t(`${prefix}.steps.s3`),
  ]

  return `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
      ${numberedList(steps, isRTL)}
    </table>
    <p style="margin: 0 0 24px;">${t(`${prefix}.body2`)}</p>
    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/resume-builder#templates`)}
    </div>
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">${t(`${prefix}.closing`)}</p>
  `
}

function renderDay7(
  t: (key: string, vars?: Record<string, string | number>) => string,
  prefix: string,
  name: string,
  isRTL: boolean,
  aiCredits: number
): string {
  const features = [
    t(`${prefix}.features.f1`),
    t(`${prefix}.features.f2`),
    t(`${prefix}.features.f3`),
    t(`${prefix}.features.f4`),
  ]

  return `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body2`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
      ${featureList(features, isRTL)}
    </table>
    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/resume-builder`)}
    </div>
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">${t(`${prefix}.closing`, { aiCredits })}</p>
  `
}

function renderDay14(
  t: (key: string, vars?: Record<string, string | number>) => string,
  prefix: string,
  name: string,
  isRTL: boolean
): string {
  const features = [
    t(`${prefix}.features.f1`),
    t(`${prefix}.features.f2`),
    t(`${prefix}.features.f3`),
    t(`${prefix}.features.f4`),
  ]

  return `
    <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827;">${t(`${prefix}.title`)}</h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">${t(`${prefix}.greeting`, { name })}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body`)}</p>
    <p style="margin: 0 0 16px;">${t(`${prefix}.body2`)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
      ${featureList(features, isRTL)}
    </table>
    <div style="text-align: center; margin: 32px 0;">
      ${ctaButton(t(`${prefix}.cta`), `${BASE_URL}/resume-builder`)}
    </div>
    <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #1e40af;">${t(`${prefix}.proTip`)}</p>
      ${ctaButton(t(`${prefix}.ctaSecondary`), `${BASE_URL}/billing`, true)}
    </div>
  `
}

/** Build a numbered step list for email HTML */
function numberedList(items: string[], isRTL: boolean): string {
  return items
    .map(
      (item, i) =>
        `<tr><td style="padding: 6px 0; font-size: 15px; color: #374151; vertical-align: top;">
          <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background: #2563eb; color: #fff; border-radius: 50%; font-size: 13px; font-weight: 600; margin-${isRTL ? 'left' : 'right'}: 10px;">${i + 1}</span>
          ${escapeHtml(item)}
        </td></tr>`
    )
    .join('')
}
