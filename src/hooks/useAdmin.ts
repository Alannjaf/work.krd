import { useEffect, useState } from 'react'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/admin-status')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        console.error('[useAdmin] Failed to check admin status:', error);
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  return { isAdmin, loading }
}