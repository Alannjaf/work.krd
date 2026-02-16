import { useEffect, useState, useRef } from 'react'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const retried = useRef(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/admin-status')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
        setLoading(false)
      } catch {
        // Retry once after 2s on network failure
        if (!retried.current) {
          retried.current = true
          setTimeout(() => checkAdminStatus(), 2000)
        } else {
          setIsAdmin(false)
          setLoading(false)
        }
      }
    }

    checkAdminStatus()
  }, [])

  return { isAdmin, loading }
}