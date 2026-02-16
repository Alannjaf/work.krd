/**
 * HTML sanitization utilities for user-generated content.
 * Used by PDF generation and any route that renders user HTML.
 */

/**
 * Strip dangerous HTML elements and attributes from a string.
 * Removes: <script>, <iframe>, <object>, <embed>, <link>, <style>, <base>,
 * on* event handlers, javascript: URLs, data: URLs in src/href, and CSS expressions.
 */
export function sanitizeHtml(value: string): string {
  return value
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe, object, embed, link, style, base tags
    .replace(/<(iframe|object|embed|link|base)\b[^>]*\/?>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove on* event handler attributes
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: and vbscript: URLs
    .replace(/\b(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')
    .replace(/\b(href|src|action)\s*=\s*(?:"vbscript:[^"]*"|'vbscript:[^']*')/gi, '')
    // Remove data: URIs in src/href (except data:image for profile photos)
    .replace(/\b(href|src)\s*=\s*"data:(?!image\/)[^"]*"/gi, '')
    .replace(/\b(href|src)\s*=\s*'data:(?!image\/)[^']*'/gi, '')
    // Remove CSS expressions
    .replace(/expression\s*\(/gi, '')
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, '')
}

/**
 * Recursively sanitize all string values in an object to remove
 * script tags and event handlers that could execute in Puppeteer.
 */
export function sanitizeResumeData(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeResumeData)
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeResumeData(value)
    }
    return result
  }
  return obj
}
