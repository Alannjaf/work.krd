import { useCallback } from 'react'

const CSRF_HEADER = 'x-csrf-token'
const STORAGE_KEY = 'csrf-token'

/**
 * Get CSRF token from sessionStorage (scoped to this browser tab).
 * Using sessionStorage instead of module-level variable prevents XSS from
 * stealing tokens across different admin sessions.
 */
function getStoredToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(STORAGE_KEY)
}

function setStoredToken(token: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, token)
}

/**
 * Hook to manage CSRF tokens for admin fetch requests.
 *
 * Usage:
 *   const { csrfFetch } = useCsrfToken()
 *   // GET requests automatically capture the token from response headers
 *   // POST/DELETE requests automatically include the token in request headers
 *   const res = await csrfFetch('/api/admin/settings')           // GET — captures token
 *   const res = await csrfFetch('/api/admin/settings', { ... })  // POST — sends token
 */
export function useCsrfToken() {
  const csrfFetch = useCallback(async (url: string, init?: RequestInit): Promise<Response> => {
    const method = (init?.method || 'GET').toUpperCase()

    // For state-changing requests, attach the CSRF token
    const currentToken = getStoredToken()
    if (method !== 'GET' && method !== 'HEAD' && currentToken) {
      const headers = new Headers(init?.headers)
      headers.set(CSRF_HEADER, currentToken)
      init = { ...init, headers }
    }

    const response = await fetch(url, init)

    // Capture CSRF token from any response that includes one
    const newToken = response.headers.get(CSRF_HEADER)
    if (newToken) {
      setStoredToken(newToken)
    }

    return response
  }, [])

  return { csrfFetch }
}
