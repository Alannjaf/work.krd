import { useEffect, useState, useRef } from 'react'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const retried = useRef(false)

  useEffect(() => {
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout>

    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/admin-status')
        if (cancelled) return
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
        setLoading(false)
      } catch {
        if (cancelled) return
        if (!retried.current) {
          retried.current = true
          retryTimer = setTimeout(() => checkAdminStatus(), 2000)
        } else {
          setIsAdmin(false)
          setLoading(false)
        }
      }
    }

    checkAdminStatus()

    return () => {
      cancelled = true
      clearTimeout(retryTimer)
    }
  }, [])

  return { isAdmin, loading }
}