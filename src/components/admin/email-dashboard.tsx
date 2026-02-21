'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Clock, AlertTriangle, Send, RefreshCw } from 'lucide-react'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { useLanguage } from '@/contexts/LanguageContext'
import { AppHeader } from '@/components/shared/AppHeader'
import { formatAdminDate, formatAdminDateFull, devError } from '@/lib/admin-utils'
import toast from 'react-hot-toast'

interface EmailOverview {
  totalSent: number
  totalPending: number
  totalFailed: number
}

interface EmailLogEntry {
  id: string
  campaign: string
  recipientEmail: string
  subject: string
  status: string
  error: string | null
  sentAt: string | null
  createdAt: string
}

interface DailySentCount {
  date: string
  count: number
}

interface EmailStats {
  overview: EmailOverview
  jobsByStatus: Record<string, number>
  campaignCounts: Record<string, number>
  deliveryCounts: Record<string, number>
  recentLogs: EmailLogEntry[]
  dailySentCounts: DailySentCount[]
}

const CAMPAIGN_KEYS: Record<string, string> = {
  WELCOME: 'pages.admin.email.campaignWelcome',
  ABANDONED_RESUME: 'pages.admin.email.campaignAbandonedResume',
  RE_ENGAGEMENT: 'pages.admin.email.campaignReEngagement',
}

const STATUS_KEYS: Record<string, string> = {
  QUEUED: 'pages.admin.email.statusQueued',
  SENT: 'pages.admin.email.statusSent',
  DELIVERED: 'pages.admin.email.statusDelivered',
  OPENED: 'pages.admin.email.statusOpened',
  FAILED: 'pages.admin.email.statusFailed',
  BOUNCED: 'pages.admin.email.statusBounced',
}

const CAMPAIGN_COLORS: Record<string, string> = {
  WELCOME: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ABANDONED_RESUME: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  RE_ENGAGEMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const STATUS_COLORS: Record<string, string> = {
  QUEUED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  OPENED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  BOUNCED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

function StatSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function EmailDashboard() {
  const { csrfFetch } = useCsrfToken()
  const { t } = useLanguage()
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await csrfFetch('/api/admin/email/stats')
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const data: EmailStats = await res.json()
      setStats(data)
    } catch (err) {
      devError('[EmailDashboard] Failed to load stats:', err)
      setError(t('pages.admin.email.failedToLoadStats'))
      toast.error(t('pages.admin.email.failedToLoadStats'))
    } finally {
      setLoading(false)
    }
  }, [csrfFetch])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Find the max daily count for scaling the chart bars
  const maxDailyCount = stats?.dailySentCounts?.reduce((max, d) => Math.max(max, d.count), 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader
        title={t('pages.admin.email.title')}
        showBackButton={true}
        backButtonText={t('pages.admin.email.backToAdmin')}
        backButtonHref="/admin"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-4" role="alert" aria-live="polite">
            <div className="flex items-center justify-between">
              <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchStats}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {t('pages.admin.email.retry')}
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6" aria-label={`${t('pages.admin.email.totalSent')}: ${stats.overview.totalSent}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.email.totalSent')}</p>
                  <p className="text-2xl font-bold">{stats.overview.totalSent.toLocaleString()}</p>
                </div>
                <Send className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6" aria-label={`${t('pages.admin.email.pending')}: ${stats.overview.totalPending}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.email.pending')}</p>
                  <p className="text-2xl font-bold">{stats.overview.totalPending.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </Card>

            <Card className="p-6" aria-label={`${t('pages.admin.email.failed')}: ${stats.overview.totalFailed}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.email.failed')}</p>
                  <p className="text-2xl font-bold">{stats.overview.totalFailed.toLocaleString()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>
        ) : null}

        {/* Campaign Breakdown + Daily Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campaign Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('pages.admin.email.campaignBreakdown')}</h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-3">
                {(['WELCOME', 'ABANDONED_RESUME', 'RE_ENGAGEMENT'] as const).map((campaign) => {
                  const count = stats.campaignCounts[campaign] ?? 0
                  const total = Object.values(stats.campaignCounts).reduce((s, c) => s + c, 0) || 1
                  const percentage = Math.round((count / total) * 100)
                  return (
                    <div key={campaign}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CAMPAIGN_COLORS[campaign]}`}>
                          {t(CAMPAIGN_KEYS[campaign])}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            campaign === 'WELCOME' ? 'bg-blue-500' :
                            campaign === 'ABANDONED_RESUME' ? 'bg-amber-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </Card>

          {/* Daily Send Volume (last 14 days) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('pages.admin.email.dailySendVolume')}</h3>
            {loading ? (
              <div className="flex items-end gap-1 h-32">
                {[68, 45, 82, 30, 95, 55, 72, 40, 88, 35, 60, 78, 50, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t animate-pulse" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : stats && stats.dailySentCounts.length > 0 ? (
              <div className="flex items-end gap-1 h-32">
                {fillDays(stats.dailySentCounts).map((day) => {
                  const height = maxDailyCount > 0 ? Math.max((day.count / maxDailyCount) * 100, 4) : 4
                  return (
                    <div
                      key={day.date}
                      className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-t hover:bg-blue-600 dark:hover:bg-blue-300 transition-colors cursor-default"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${day.count} emails`}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                <Mail className="h-5 w-5 mr-2" />
                {t('pages.admin.email.noEmailData')}
              </div>
            )}
            {stats && stats.dailySentCounts.length > 0 && (
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{fillDays(stats.dailySentCounts)[0]?.date.slice(5)}</span>
                <span>{fillDays(stats.dailySentCounts).at(-1)?.date.slice(5)}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Delivery Status Breakdown */}
        {stats && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('pages.admin.email.deliveryStatus')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(['QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'FAILED', 'BOUNCED'] as const).map((status) => (
                <div key={status} className="text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status]}`}>
                    {t(STATUS_KEYS[status])}
                  </span>
                  <p className="text-lg font-bold mt-1 text-gray-900 dark:text-gray-100">
                    {(stats.deliveryCounts[status] ?? 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Logs Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('pages.admin.email.recentEmailLogs')}</h3>
            <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {t('pages.admin.email.refresh')}
            </Button>
          </div>
          {loading ? (
            <TableSkeleton />
          ) : stats && stats.recentLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">{t('pages.admin.email.recipient')}</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">{t('pages.admin.email.campaign')}</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">{t('pages.admin.email.subject')}</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">{t('pages.admin.email.status')}</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">{t('pages.admin.email.sent')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={log.recipientEmail}>
                        {log.recipientEmail}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CAMPAIGN_COLORS[log.campaign] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {CAMPAIGN_KEYS[log.campaign] ? t(CAMPAIGN_KEYS[log.campaign]) : log.campaign}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300 truncate max-w-[250px]" title={log.subject}>
                        {log.subject}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[log.status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {STATUS_KEYS[log.status] ? t(STATUS_KEYS[log.status]) : log.status}
                        </span>
                        {log.error && (
                          <span className="block text-xs text-red-600 dark:text-red-400 mt-0.5 truncate max-w-[150px]" title={log.error}>
                            {log.error}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap" title={formatAdminDateFull(log.sentAt ?? log.createdAt)}>
                        {formatAdminDate(log.sentAt ?? log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('pages.admin.email.noEmailLogs')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/** Fill in missing days in the last 14 days with 0 counts */
function fillDays(data: DailySentCount[]): DailySentCount[] {
  const map = new Map(data.map(d => [d.date, d.count]))
  const days: DailySentCount[] = []
  const now = new Date()

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    days.push({ date, count: map.get(date) ?? 0 })
  }

  return days
}
