'use client'

import { useCallback, useEffect, useState } from 'react'

interface RecentItem {
  id: string
  type: 'user' | 'resume' | 'payment'
  label: string
  viewedAt: string
}

const STORAGE_KEY = 'admin-recently-viewed'
const MAX_ITEMS = 10

/** Track recently viewed admin items in localStorage */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore parse errors
    }
  }, [])

  const addItem = useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setItems(prev => {
      const filtered = prev.filter(i => !(i.id === item.id && i.type === item.type))
      const updated = [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }, [])

  const clearItems = useCallback(() => {
    setItems([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [])

  return { items, addItem, clearItems }
}
