'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const REFERRAL_STORAGE_KEY = 'work_krd_referral_code'

/**
 * Captures ?ref=CODE from URL and stores in localStorage.
 * Render this in any page where referral links might land.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && ref.trim().length > 0) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, ref.trim().toUpperCase())
    }
  }, [searchParams])

  return null
}

/** Get stored referral code from localStorage */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFERRAL_STORAGE_KEY)
}

/** Clear stored referral code after it's been applied */
export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(REFERRAL_STORAGE_KEY)
}
