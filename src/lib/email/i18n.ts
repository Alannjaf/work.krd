/**
 * Email translation loader — server-side only.
 * Loads email.json files for a given locale and provides a t() function
 * that supports nested key lookup and variable interpolation.
 */

import fs from 'fs'
import path from 'path'

type Locale = 'en' | 'ar' | 'ckb'

// Module-level cache — loaded once per cold start
const translationCache: Partial<Record<Locale, Record<string, unknown>>> = {}

function loadTranslations(locale: Locale): Record<string, unknown> {
  if (translationCache[locale]) {
    return translationCache[locale]!
  }

  const filePath = path.join(process.cwd(), 'src', 'locales', locale, 'email.json')

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as Record<string, unknown>
    translationCache[locale] = data
    return data
  } catch {
    // Fallback to English if locale file is missing
    if (locale !== 'en') {
      return loadTranslations('en')
    }
    return {}
  }
}

/**
 * Resolve a dot-separated key path in a nested object.
 * e.g. "welcome.day0.subject" → translations.welcome.day0.subject
 */
function resolveKey(obj: Record<string, unknown>, keyPath: string): string | undefined {
  const parts = keyPath.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === 'string' ? current : undefined
}

interface TranslationVariables {
  [key: string]: string | number
}

/**
 * Get a translation function for email templates.
 * Usage:
 *   const t = getEmailTranslation('ar')
 *   t('welcome.day0.subject') // => "مرحبًا بك في Work.krd..."
 *   t('welcome.day0.greeting', { name: 'Ahmad' }) // => "مرحبًا Ahmad،"
 */
export function getEmailTranslation(locale: Locale): (key: string, variables?: TranslationVariables) => string {
  const translations = loadTranslations(locale)

  return (key: string, variables?: TranslationVariables): string => {
    const value = resolveKey(translations, key)

    if (value === undefined) {
      // Fallback to English
      if (locale !== 'en') {
        const enTranslations = loadTranslations('en')
        const enValue = resolveKey(enTranslations, key)
        if (enValue !== undefined) {
          return interpolate(enValue, variables)
        }
      }
      return key // Return key as last resort
    }

    return interpolate(value, variables)
  }
}

function interpolate(template: string, variables?: TranslationVariables): string {
  if (!variables) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : `{${key}}`
  })
}

/** Check if a locale is RTL (used by email layout) */
export function isRTLLocale(locale: Locale): boolean {
  return locale === 'ar' || locale === 'ckb'
}
