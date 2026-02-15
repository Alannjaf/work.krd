'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react'

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
  if (!subscriptionStatus) {
    return (
      <Card className="p-6 mb-8">
        <div className="text-center text-gray-500">
          <p>Unable to load subscription status</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={onCheckExpired}>
            Retry
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
          Subscription Status
        </h2>
        <Button
          onClick={() => {
            const count = (subscriptionStatus?.expired?.count || 0)
            if (count === 0 || window.confirm(`This will downgrade ${count} expired subscription(s) to FREE. Continue?`)) {
              onCheckExpired()
            }
          }}
          disabled={checkingSubscriptions}
          variant="outline"
          size="sm"
        >
          {checkingSubscriptions ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check & Process Expired
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-medium text-red-700">
              Expired Subscriptions ({subscriptionStatus.expired.count})
            </h3>
          </div>
          {subscriptionStatus.expired.count > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {subscriptionStatus.expired.subscriptions.map((sub) => (
                <div key={sub.userId} className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="font-medium text-sm">{sub.userName || sub.userEmail}</p>
                  {sub.userName && <p className="text-xs text-gray-500">{sub.userEmail}</p>}
                  <p className="text-xs text-gray-600">
                    {sub.plan} plan - {sub.daysOverdue} days overdue
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-green-50 p-3 rounded border border-green-200">
              No expired subscriptions found
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium text-orange-700">
              Expiring Soon ({subscriptionStatus.expiringSoon.count})
            </h3>
          </div>
          {subscriptionStatus.expiringSoon.count > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {subscriptionStatus.expiringSoon.subscriptions.map((sub) => (
                <div key={sub.userId} className="bg-orange-50 p-3 rounded border border-orange-200">
                  <p className="font-medium text-sm">{sub.userName || sub.userEmail}</p>
                  {sub.userName && <p className="text-xs text-gray-500">{sub.userEmail}</p>}
                  <p className="text-xs text-gray-600">
                    {sub.plan} plan - expires in {sub.daysUntilExpiry} days
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
              No subscriptions expiring soon
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

