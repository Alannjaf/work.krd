import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

const CSRF_HEADER = 'x-csrf-token'
const TOKEN_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

interface StoredToken {
  token: string
  expiresAt: number
}

// In-memory token store keyed by admin userId
// Each admin gets one active token at a time
const tokenStore = new Map<string, StoredToken>()

/**
 * Generate a CSRF token for a given admin user and return it.
 * Old tokens for the same user are replaced.
 */
export function generateCsrfToken(userId: string): string {
  // Clean up expired tokens periodically
  pruneExpiredTokens()

  const token = randomBytes(32).toString('hex')
  tokenStore.set(userId, {
    token,
    expiresAt: Date.now() + TOKEN_EXPIRY_MS,
  })
  return token
}

/**
 * Validate a CSRF token from the request header against the stored token for a user.
 * Returns true if valid, false otherwise. Consumed tokens are NOT deleted
 * so the same token can be reused within its expiry window (admin may make
 * multiple requests before the next GET refreshes the token).
 */
export function validateCsrfToken(userId: string, token: string | null): boolean {
  if (!token) return false

  // Prune expired tokens on every validation to prevent unbounded growth
  pruneExpiredTokens()

  const stored = tokenStore.get(userId)
  if (!stored) return false

  // Check expiration
  if (Date.now() > stored.expiresAt) {
    tokenStore.delete(userId)
    return false
  }

  // Constant-time comparison to prevent timing attacks
  if (token.length !== stored.token.length) return false
  let mismatch = 0
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ stored.token.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Attach a CSRF token to a GET response for an admin user.
 * The client reads this header and sends it back on POST/DELETE requests.
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

/**
 * Remove expired tokens from the store.
 */
function pruneExpiredTokens(): void {
  const now = Date.now()
  for (const [userId, stored] of tokenStore) {
    if (now > stored.expiresAt) {
      tokenStore.delete(userId)
    }
  }
}

export { CSRF_HEADER }
