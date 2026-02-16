'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { PaymentItem } from './PaymentItem'
import { PaymentApprovalForm } from './PaymentApprovalForm'
import type { Payment, PaymentsResponse, StatusFilter } from './PaymentItem'
import { ADMIN_PAGINATION } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'

// ─── Component ──────────────────────────────────────────────────────────────

interface PaymentListProps {
  csrfFetch: (url: string, options?: RequestInit) => Promise<Response>
}

export function PaymentList({ csrfFetch }: PaymentListProps) {
  const initialParams = useMemo(() => {
    if (typeof window === 'undefined') return { search: '', status: 'PENDING' as StatusFilter }
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    const validStatuses: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED']
    return {
      search: params.get('search') || '',
      status: (status && validStatuses.includes(status as StatusFilter) ? status : 'PENDING') as StatusFilter,
    }
  }, [])

  const [payments, setPayments] = useState<Payment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>(initialParams.status)
  const [searchTerm, setSearchTerm] = useState(initialParams.search)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Review modal state
  const [reviewPayment, setReviewPayment] = useState<Payment | null>(null)

  const LIMIT = ADMIN_PAGINATION.PAYMENTS

  // ─── Fetch payments ─────────────────────────────────────────────────────

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      })
      if (filter !== 'ALL') {
        params.set('status', filter)
      }
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim())
      }
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      const res = await csrfFetch(`/api/admin/payments?${params}`)
      if (!res.ok) throw new Error('Failed to fetch payments')
      const data: PaymentsResponse = await res.json()
      setPayments(data.payments)
      setTotal(data.total)
    } catch (error) {
      devError('[PaymentList] Failed to fetch:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [page, filter, searchTerm, dateFrom, dateTo, csrfFetch])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1)
  }, [filter, searchTerm, dateFrom, dateTo])

  // ─── Review handlers ────────────────────────────────────────────────────

  const openReview = (payment: Payment) => {
    setReviewPayment(payment)
  }

  const closeReview = () => {
    setReviewPayment(null)
  }

  // ─── Derived values ─────────────────────────────────────────────────────

  const totalPages = Math.ceil(total / LIMIT)
  const pendingCount = filter === 'PENDING' ? total : null

  // ─── Filter tabs ────────────────────────────────────────────────────────

  const filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Refunded', value: 'REFUNDED' },
  ]

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            Payment Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage payment submissions
          </p>
        </div>

        {/* Search + Stats */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by user email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{total} total payment{total !== 1 ? 's' : ''}</span>
            {pendingCount !== null && (
              <span className="text-yellow-700 font-medium">
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.value
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date range filter */}
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-date-from" className="text-xs font-medium text-gray-500 dark:text-gray-400">
              From
            </label>
            <input
              id="payment-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-date-to" className="text-xs font-medium text-gray-500 dark:text-gray-400">
              To
            </label>
            <input
              id="payment-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setDateFrom(''); setDateTo('') }}
              type="button"
              className="h-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4 mr-1" />
              Clear dates
            </Button>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        ) : payments.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700">
            <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No payments found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {filter !== 'ALL'
                ? `No ${filter.toLowerCase()} payments`
                : 'No payments have been submitted yet'}
            </p>
          </div>
        ) : (
          /* Payment cards */
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentItem
                key={payment.id}
                payment={payment}
                onReview={openReview}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewPayment && (
        <PaymentApprovalForm
          payment={reviewPayment}
          csrfFetch={csrfFetch}
          onClose={closeReview}
          onActionComplete={fetchPayments}
        />
      )}
    </>
  )
}
