'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { formatAdminDate, formatAdminDateFull, devError } from '@/lib/admin-utils'

interface AuditEntry {
  id: string
  adminId: string
  action: string
  target: string
  details: Record<string, unknown> | null
  createdAt: string
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  UPDATE_SETTINGS: { label: 'Settings Updated', color: 'bg-blue-100 text-blue-800' },
  APPROVE_PAYMENT: { label: 'Payment Approved', color: 'bg-green-100 text-green-800' },
  REJECT_PAYMENT: { label: 'Payment Rejected', color: 'bg-red-100 text-red-800' },
  CHANGE_USER_PLAN: { label: 'Plan Changed', color: 'bg-purple-100 text-purple-800' },
  PROCESS_EXPIRED_SUBSCRIPTIONS: { label: 'Expired Processed', color: 'bg-amber-100 text-amber-800' },
}

function getActionInfo(action: string) {
  return ACTION_LABELS[action] ?? { label: action, color: 'bg-gray-100 text-gray-800' }
}

function AuditEntrySkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 animate-pulse">
      <div className="h-5 w-24 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

export function AuditLogPanel() {
  const { csrfFetch } = useCsrfToken()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await csrfFetch('/api/admin/audit-log')
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const data = await res.json()
      setLogs(data.logs)
    } catch (err) {
      devError('[AuditLogPanel] Failed to fetch audit logs:', err)
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [csrfFetch])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-500">Recent admin actions</p>
        </div>
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

      <div className="divide-y divide-gray-100">
        {loading && logs.length === 0 ? (
          <>
            <AuditEntrySkeleton />
            <AuditEntrySkeleton />
            <AuditEntrySkeleton />
          </>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No audit entries yet</div>
        ) : (
          logs.map((entry) => {
            const { label, color } = getActionInfo(entry.action)
            return (
              <div key={entry.id} className="flex items-start gap-3 px-6 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
                  {label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {entry.target}
                    {entry.details && typeof entry.details === 'object' && 'userEmail' in entry.details && (
                      <span className="text-gray-500"> &mdash; {String(entry.details.userEmail)}</span>
                    )}
                    {entry.details && typeof entry.details === 'object' && 'updatedFields' in entry.details && Array.isArray(entry.details.updatedFields) && (
                      <span className="text-gray-500"> &mdash; {(entry.details.updatedFields as string[]).join(', ')}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5" title={formatAdminDateFull(entry.createdAt)}>{formatAdminDate(entry.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
