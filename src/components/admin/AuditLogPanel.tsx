'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { RefreshCw, X, Download } from 'lucide-react'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { formatAdminDate, formatAdminDateFull, devError } from '@/lib/admin-utils'
import { ADMIN_PAGINATION } from '@/lib/constants'

const LIMIT = ADMIN_PAGINATION.AUDIT_LOGS

interface AuditEntry {
  id: string
  adminId: string
  action: string
  target: string
  details: Record<string, unknown> | null
  createdAt: string
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  UPDATE_SETTINGS: { label: 'Settings Updated', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  APPROVE_PAYMENT: { label: 'Payment Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  REJECT_PAYMENT: { label: 'Payment Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  CHANGE_USER_PLAN: { label: 'Plan Changed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  PROCESS_EXPIRED_SUBSCRIPTIONS: { label: 'Expired Processed', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  REVERT_SETTINGS: { label: 'Settings Reverted', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  BULK_UPGRADE: { label: 'Bulk Upgrade', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  BULK_DOWNGRADE: { label: 'Bulk Downgrade', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  REFUND_PAYMENT: { label: 'Payment Refunded', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
}

const ACTION_OPTIONS = [
  'UPDATE_SETTINGS',
  'APPROVE_PAYMENT',
  'REJECT_PAYMENT',
  'CHANGE_USER_PLAN',
  'PROCESS_EXPIRED_SUBSCRIPTIONS',
  'REVERT_SETTINGS',
  'BULK_UPGRADE',
  'BULK_DOWNGRADE',
  'REFUND_PAYMENT',
] as const

function getActionInfo(action: string) {
  return ACTION_LABELS[action] ?? { label: action, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' }
}

function AuditEntrySkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 animate-pulse">
      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  )
}

const dateInputClassName = 'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100'

export function AuditLogPanel() {
  const { csrfFetch } = useCsrfToken()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const hasActiveFilters = actionFilter !== '' || dateFrom !== '' || dateTo !== ''

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(LIMIT))
      if (actionFilter) params.set('action', actionFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await csrfFetch(`/api/admin/audit-log?${params.toString()}`)
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const data = await res.json()
      setLogs(data.logs)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      devError('[AuditLogPanel] Failed to fetch audit logs:', err)
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [csrfFetch, page, actionFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [actionFilter, dateFrom, dateTo])

  const clearFilters = () => {
    setActionFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const handleExportCSV = () => {
    const csv = [
      ['Action', 'Target', 'Details', 'Date'],
      ...logs.map(entry => [
        entry.action,
        entry.target,
        entry.details ? JSON.stringify(entry.details) : '',
        entry.createdAt
      ])
    ].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Log</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total > 0 ? `${total} total entries` : 'Recent admin actions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || logs.length === 0}
            type="button"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            type="button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Action type filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="audit-action-filter" className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Action Type
            </label>
            <select
              id="audit-action-filter"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className={dateInputClassName}
            >
              <option value="">All Actions</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {ACTION_LABELS[action]?.label ?? action}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <label htmlFor="audit-date-from" className="text-xs font-medium text-gray-500 dark:text-gray-400">
              From
            </label>
            <input
              id="audit-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={dateInputClassName}
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label htmlFor="audit-date-to" className="text-xs font-medium text-gray-500 dark:text-gray-400">
              To
            </label>
            <input
              id="audit-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={dateInputClassName}
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              type="button"
              className="h-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Log entries */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {loading && logs.length === 0 ? (
          <>
            <AuditEntrySkeleton />
            <AuditEntrySkeleton />
            <AuditEntrySkeleton />
          </>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {hasActiveFilters ? 'No entries match the current filters' : 'No audit entries yet'}
          </div>
        ) : (
          logs.map((entry) => {
            const { label, color } = getActionInfo(entry.action)
            return (
              <div key={entry.id} className="flex items-start gap-3 px-6 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
                  {label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {entry.target}
                    {entry.details && typeof entry.details === 'object' && 'userEmail' in entry.details && (
                      <span className="text-gray-500 dark:text-gray-400"> &mdash; {String(entry.details.userEmail)}</span>
                    )}
                    {entry.details && typeof entry.details === 'object' && 'updatedFields' in entry.details && Array.isArray(entry.details.updatedFields) && (
                      <span className="text-gray-500 dark:text-gray-400"> &mdash; {(entry.details.updatedFields as string[]).join(', ')}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" title={formatAdminDateFull(entry.createdAt)}>
                    {formatAdminDate(entry.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Page {page} of {totalPages} ({total} entries)
          </p>
        </div>
      )}
    </div>
  )
}
