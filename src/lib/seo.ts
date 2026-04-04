// SEO utilities — hreflang, verification, and cross-linking helpers

const BASE_URL = 'https://work.krd'

/**
 * Generate hreflang alternates for Next.js metadata.
 *
 * Since work.krd serves all three languages (en, ar, ckb) from the same URL
 * via client-side language switching, we declare each URL as x-default and
 * point all three language tags to the same canonical URL.
 * This tells search engines "this page handles all three languages."
 */
export function generateHreflangAlternates(path: string) {
  const url = path === '/' ? BASE_URL : `${BASE_URL}${path}`
  return {
    canonical: url,
    languages: {
      'en': url,
      'ar': url,
      'ku': url,        // Kurdish (Sorani) — ISO 639-1
      'x-default': url, // Default fallback for unmatched languages
    },
  }
}

/**
 * Google Search Console verification code.
 * Set NEXT_PUBLIC_GSC_VERIFICATION in your environment variables.
 * Example: NEXT_PUBLIC_GSC_VERIFICATION=google1234567890abcdef
 */
export function getGSCVerificationCode(): string | undefined {
  return process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined
}
