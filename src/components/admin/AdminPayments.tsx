'use client'

import { AppHeader } from '@/components/shared/AppHeader'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { PaymentList } from './PaymentList'
import { useLanguage } from '@/contexts/LanguageContext'

export function AdminPayments() {
  const { csrfFetch } = useCsrfToken()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader
        title={t('pages.admin.payments.title')}
        showBackButton={true}
        backButtonText={t('pages.admin.payments.backToAdmin')}
        backButtonHref="/admin"
      />
      <PaymentList csrfFetch={csrfFetch} />
    </div>
  )
}
