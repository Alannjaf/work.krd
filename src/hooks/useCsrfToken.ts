import { useCallback } from 'react'

const CSRF_HEADER = 'x-csrf-token'

// Module-level token store shared across all hook instances.
// This ensures a token captured by one component's GET is available
// for another component's POST (e.g., ResumeManagement GET → AdminResumePreview POST).
let csrfToken: string | null = null

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
    if (method !== 'GET' && method !== 'HEAD' && csrfToken) {
      const headers = new Headers(init?.headers)
      headers.set(CSRF_HEADER, csrfToken)
      init = { ...init, headers }
    }

    const response = await fetch(url, init)

    // Capture CSRF token from any response that includes one
    const newToken = response.headers.get(CSRF_HEADER)
    if (newToken) {
      csrfToken = newToken
    }

    return response
  }, [])

  return { csrfFetch }
}
