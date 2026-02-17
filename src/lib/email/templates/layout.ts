/**
 * RTL-aware base email layout.
 * Auto-detects direction from locale (ar/ckb = RTL, en = LTR).
 * Uses Noto Sans Arabic for RTL, Inter for LTR.
 *
 * All campaign templates call wrapInLayout() to get consistent
 * header, footer, unsubscribe link, and RTL support.
 */

import { getEmailTranslation, isRTLLocale } from '../i18n'

type Locale = 'en' | 'ar' | 'ckb'

interface LayoutOptions {
  locale: Locale
  /** Main body HTML content */
  body: string
  /** Email preheader text (shown in inbox preview) */
  preheader?: string
  /** Unsubscribe URL (HMAC-signed) */
  unsubscribeUrl: string
}

const BRAND_COLOR = '#2563eb'
const BRAND_COLOR_DARK = '#1d4ed8'
const TEXT_COLOR = '#333333'
const MUTED_COLOR = '#6b7280'
const BG_COLOR = '#f4f4f5'
const CARD_BG = '#ffffff'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://work.krd'

/** Get the appropriate font stack based on locale direction */
function getFontStack(isRTL: boolean): string {
  if (isRTL) {
    return "'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif"
  }
  return "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
}

/** Google Fonts import link for the email <head> */
function getFontImport(isRTL: boolean): string {
  if (isRTL) {
    return '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">'
  }
  return '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">'
}

/**
 * Wrap campaign email content in the base layout with
 * header, footer, branding, and RTL support.
 */
export function wrapInLayout({ locale, body, preheader, unsubscribeUrl }: LayoutOptions): string {
  const isRTL = isRTLLocale(locale)
  const dir = isRTL ? 'rtl' : 'ltr'
  const align = isRTL ? 'right' : 'left'
  const fontStack = getFontStack(isRTL)
  const fontImport = getFontImport(isRTL)
  const t = getEmailTranslation(locale)

  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  ${fontImport}
  <title>${t('common.header.tagline')}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: ${BRAND_COLOR}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .btn { display: inline-block; padding: 14px 32px; background: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .btn:hover { background: ${BRAND_COLOR_DARK}; }
    .btn-secondary { background: transparent; color: ${BRAND_COLOR} !important; border: 2px solid ${BRAND_COLOR}; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px 16px !important; }
      .btn { padding: 12px 24px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_COLOR}; font-family: ${fontStack}; direction: ${dir};">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}${'&nbsp;'.repeat(50)}</div>` : ''}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BG_COLOR};">
    <tr>
      <td align="center" style="padding: 24px 0;">

        <!-- Main container -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: ${CARD_BG}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_DARK}); padding: 24px 40px; text-align: center;">
              <a href="${BASE_URL}" style="text-decoration: none;">
                <span style="font-family: ${fontStack}; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Work.krd</span>
              </a>
              <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">${t('common.header.tagline')}</p>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td class="content" style="padding: 40px; text-align: ${align}; font-size: 16px; line-height: 1.6; color: ${TEXT_COLOR}; font-family: ${fontStack};">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <!-- Footer links -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 16px;">
                    <a href="${BASE_URL}/dashboard" style="color: ${MUTED_COLOR}; font-size: 13px; margin: 0 8px;">${t('common.footer.links.dashboard')}</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="${BASE_URL}/resume-builder" style="color: ${MUTED_COLOR}; font-size: 13px; margin: 0 8px;">${t('common.footer.links.templates')}</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="${BASE_URL}/billing" style="color: ${MUTED_COLOR}; font-size: 13px; margin: 0 8px;">${t('common.footer.links.pricing')}</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 12px;">
                    <p style="margin: 0; font-size: 13px; color: ${MUTED_COLOR};">${t('common.footer.company')} — ${t('common.footer.tagline')}</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: ${MUTED_COLOR};">${t('common.footer.address')}</p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 8px;">
                    <p style="margin: 0; font-size: 12px; color: ${MUTED_COLOR};">
                      ${t('common.unsubscribe.text')}
                      <br>
                      <a href="${unsubscribeUrl}" style="color: ${MUTED_COLOR}; text-decoration: underline;">${t('common.unsubscribe.link')}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #9ca3af;">${t('common.legal.copyright', { year })}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Build a styled CTA button */
export function ctaButton(text: string, url: string, secondary = false): string {
  const cls = secondary ? 'btn btn-secondary' : 'btn'
  return `<a href="${escapeHtml(url)}" class="${cls}" style="display: inline-block; padding: 14px 32px; ${
    secondary
      ? `background: transparent; color: ${BRAND_COLOR}; border: 2px solid ${BRAND_COLOR};`
      : `background: ${BRAND_COLOR}; color: #ffffff;`
  } text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${escapeHtml(text)}</a>`
}

/** Build a feature/bullet list suitable for email HTML */
export function featureList(items: string[], isRTL: boolean): string {
  const bulletChar = isRTL ? '◂' : '▸'
  return items
    .map(
      (item) =>
        `<tr><td style="padding: 4px 0; font-size: 15px; color: ${TEXT_COLOR}; vertical-align: top;">
          <span style="color: ${BRAND_COLOR}; margin-${isRTL ? 'left' : 'right'}: 8px;">${bulletChar}</span>
          ${escapeHtml(item)}
        </td></tr>`
    )
    .join('')
}

/** Escape HTML to prevent injection in dynamic content */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export { escapeHtml }
