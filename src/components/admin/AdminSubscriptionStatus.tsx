'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface SubscriptionStatus {
  expired: {
    count: number
    subscriptions: Array<{
      userId: string
      userEmail: string
      userName: string
      plan: string
      endDate: string
      daysOverdue: number
    }>
  }
  expiringSoon: {
    count: number
    subscriptions: Array<{
      userId: string
      userEmail: string
      userName: string
      plan: string
      endDate: string
      daysUntilExpiry: number
    }>
  }
}

interface AdminSubscriptionStatusProps {
  subscriptionStatus: SubscriptionStatus | null
  checkingSubscriptions: boolean
  onCheckExpired: () => void
}

export function AdminSubscriptionStatus({
  subscriptionStatus,
  checkingSubscriptions,
  onCheckExpired
}: AdminSubscriptionStatusProps) {
  const { t } = useLanguage()

  if (!subscriptionStatus) {
    return (
      <Card className="p-6 mb-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>{t('pages.admin.subscription.unableToLoad')}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={onCheckExpired}>
            {t('pages.admin.subscription.retry')}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('pages.admin.subscription.title')}
        </h2>
        <Button
          onClick={() => {
            const count = (subscriptionStatus?.expired?.count || 0)
            if (count === 0 || window.confirm(t('pages.admin.subscription.confirmProcess', { count: String(count) }))) {
              onCheckExpired()
            }
          }}
          disabled={checkingSubscriptions}
          variant="outline"
          size="sm"
        >
          {checkingSubscriptions ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full" />
              {t('pages.admin.subscription.checking')}
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('pages.admin.subscription.checkAndProcess')}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-medium text-red-700 dark:text-red-400">
              {t('pages.admin.subscription.expired')} ({subscriptionStatus.expired.count})
            </h3>
          </div>
          {subscriptionStatus.expired.count > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {subscriptionStatus.expired.subscriptions.map((sub) => (
                <div key={sub.userId} className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">
                  <p className="font-medium text-sm">{sub.userName || sub.userEmail}</p>
                  {sub.userName && <p className="text-xs text-gray-500 dark:text-gray-400">{sub.userEmail}</p>}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('pages.admin.subscription.daysOverdue', { plan: sub.plan, days: String(sub.daysOverdue) })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-950 p-3 rounded border border-green-200 dark:border-green-800">
              {t('pages.admin.subscription.noExpired')}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium text-orange-700 dark:text-orange-400">
              {t('pages.admin.subscription.expiringSoon')} ({subscriptionStatus.expiringSoon.count})
            </h3>
          </div>
          {subscriptionStatus.expiringSoon.count > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {subscriptionStatus.expiringSoon.subscriptions.map((sub) => (
                <div key={sub.userId} className="bg-orange-50 dark:bg-orange-950 p-3 rounded border border-orange-200 dark:border-orange-800">
                  <p className="font-medium text-sm">{sub.userName || sub.userEmail}</p>
                  {sub.userName && <p className="text-xs text-gray-500 dark:text-gray-400">{sub.userEmail}</p>}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('pages.admin.subscription.expiresInDays', { plan: sub.plan, days: String(sub.daysUntilExpiry) })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
              {t('pages.admin.subscription.noExpiringSoon')}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

