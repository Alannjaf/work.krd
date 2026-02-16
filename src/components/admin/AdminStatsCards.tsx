'use client'

import { Card } from '@/components/ui/card'
import { Users, DollarSign, FileText, CreditCard } from 'lucide-react'
import { Stats } from './types'
import { useLanguage } from '@/contexts/LanguageContext'

interface AdminStatsCardsProps {
  stats: Stats | null
  loading?: boolean
}

function StatSkeleton({ colSpan, showSubStats }: { colSpan?: string; showSubStats?: boolean }) {
  return (
    <Card className={`p-6 ${colSpan ?? ''}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          {showSubStats && (
            <div className="flex gap-3 mt-1">
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-18 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          )}
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    </Card>
  )
}

export function AdminStatsCards({ stats, loading }: AdminStatsCardsProps) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" role="region" aria-label={t('pages.admin.stats.loadingLabel')}>
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton colSpan="md:col-span-2 lg:col-span-2" showSubStats />
      </div>
    )
  }

  const totalPayments = stats?.payments
    ? stats.payments.pending + stats.payments.approved + stats.payments.rejected
    : 0

  const userCount = stats?.totalUsers ?? 0
  const resumeCount = stats?.totalResumes ?? 0
  const subCount = stats?.activeSubscriptions ?? 0
  const revenueAmount = stats?.revenue ?? 0

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${loading ? 'opacity-60 transition-opacity' : ''}`} role="region" aria-label={t('pages.admin.stats.statsLabel')}>
      <Card className="p-6" aria-label={`${t('pages.admin.stats.totalUsers')}: ${userCount}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.stats.totalUsers')}</p>
            <p className="text-2xl font-bold">{userCount}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6" aria-label={`${t('pages.admin.stats.totalResumes')}: ${resumeCount}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.stats.totalResumes')}</p>
            <p className="text-2xl font-bold">{resumeCount}</p>
          </div>
          <FileText className="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-6" aria-label={`${t('pages.admin.stats.proSubscriptions')}: ${subCount}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.stats.proSubscriptions')}</p>
            <p className="text-2xl font-bold">{subCount}</p>
          </div>
          <DollarSign className="h-8 w-8 text-purple-500" />
        </div>
      </Card>

      <Card className="p-6" aria-label={`${t('pages.admin.stats.monthlyRevenue')}: ${revenueAmount.toLocaleString()} IQD`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.stats.monthlyRevenue')}</p>
            <p className="text-2xl font-bold">{revenueAmount.toLocaleString()} IQD</p>
          </div>
          <DollarSign className="h-8 w-8 text-yellow-500" />
        </div>
      </Card>

      <Card className="p-6 md:col-span-2 lg:col-span-2" aria-label={`${t('pages.admin.stats.payments')}: ${totalPayments}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.stats.payments')}</p>
            <p className="text-2xl font-bold">{totalPayments}</p>
            {stats?.payments && (
              <div className="flex gap-3 mt-1 text-xs">
                <span className="text-amber-600">{stats.payments.pending} {t('pages.admin.stats.pending')}</span>
                <span className="text-green-600">{stats.payments.approved} {t('pages.admin.stats.approved')}</span>
                <span className="text-red-600">{stats.payments.rejected} {t('pages.admin.stats.rejected')}</span>
              </div>
            )}
          </div>
          <CreditCard className="h-8 w-8 text-indigo-500" />
        </div>
      </Card>
    </div>
  )
}
