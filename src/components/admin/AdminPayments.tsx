'use client'

import { AppHeader } from '@/components/shared/AppHeader'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { PaymentList } from './PaymentList'

export function AdminPayments() {
  const { csrfFetch } = useCsrfToken()

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Payment Reviews"
        showBackButton={true}
        backButtonText="Back to Admin"
        backButtonHref="/admin"
      />
      <PaymentList csrfFetch={csrfFetch} />
    </div>
  )
}
