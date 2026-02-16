import { createHmac, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

const CSRF_HEADER = 'x-csrf-token'
const TOKEN_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes

// Use CLERK_SECRET_KEY as HMAC secret (always available in server environment)
function getSecret(): string {
  const secret = process.env.CLERK_SECRET_KEY || process.env.CRON_SECRET || 'fallback-dev-secret'
  return secret
}

/**
 * Generate a signed CSRF token for a given admin user.
 * Format: timestamp.nonce.signature
 * Stateless — no server-side storage needed (works on serverless).
 */
export function generateCsrfToken(userId: string): string {
  const timestamp = Date.now().toString()
  const nonce = randomBytes(16).toString('hex')
  const payload = `${userId}:${timestamp}:${nonce}`
  const signature = createHmac('sha256', getSecret()).update(payload).digest('hex')
  return `${timestamp}.${nonce}.${signature}`
}

/**
 * Validate a signed CSRF token. Stateless — verifies signature and expiry.
 */
export function validateCsrfToken(userId: string, token: string | null): boolean {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [timestamp, nonce, signature] = parts

  // Check expiration
  const tokenAge = Date.now() - parseInt(timestamp, 10)
  if (isNaN(tokenAge) || tokenAge > TOKEN_EXPIRY_MS || tokenAge < 0) return false

  // Verify signature
  const payload = `${userId}:${timestamp}:${nonce}`
  const expected = createHmac('sha256', getSecret()).update(payload).digest('hex')

  // Constant-time comparison
  if (signature.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }

  return mismatch === 0
}

/**
 * Attach a CSRF token to a response for an admin user.
 */
export function attachCsrfToken(response: NextResponse, userId: string): NextResponse {
  const token = generateCsrfToken(userId)
  response.headers.set(CSRF_HEADER, token)
  return response
}

/**
 * Extract the CSRF token from a request's headers.
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  return request.headers.get(CSRF_HEADER)
}

export { CSRF_HEADER }
