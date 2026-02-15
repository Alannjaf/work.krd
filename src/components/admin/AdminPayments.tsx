'use client'

import { useEffect, useState, useCallback } from 'react'
import { AppHeader } from '@/components/shared/AppHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  Loader2,
  ImageIcon,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface PaymentUser {
  name: string
  email: string
}

interface Payment {
  id: string
  plan: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt: string | null
  adminNote: string | null
  user: PaymentUser
}

interface PaymentsResponse {
  payments: Payment[]
  total: number
  page: number
  limit: number
}

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IQ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' IQD'
}

function statusBadgeClass(status: Payment['status']) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200'
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('PENDING')

  // Review modal state
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewScreenshot, setReviewScreenshot] = useState<string | null>(null)
  const [reviewPayment, setReviewPayment] = useState<Payment | null>(null)
  const [loadingScreenshot, setLoadingScreenshot] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const LIMIT = 20

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
      const res = await fetch(`/api/admin/payments?${params}`)
      if (!res.ok) throw new Error('Failed to fetch payments')
      const data: PaymentsResponse = await res.json()
      setPayments(data.payments)
      setTotal(data.total)
    } catch (error) {
      console.error('[AdminPayments] Failed to fetch:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [filter])

  // ─── Review handlers ────────────────────────────────────────────────────

  const openReview = async (payment: Payment) => {
    setReviewingId(payment.id)
    setReviewPayment(payment)
    setReviewScreenshot(null)
    setRejectNote('')
    setLoadingScreenshot(true)

    try {
      const res = await fetch(`/api/admin/payments/${payment.id}/review`)
      if (!res.ok) throw new Error('Failed to load payment details')
      const data = await res.json()
      setReviewScreenshot(data.screenshot || null)
    } catch (error) {
      console.error('[AdminPayments] Failed to load review:', error)
      toast.error('Failed to load screenshot')
    } finally {
      setLoadingScreenshot(false)
    }
  }

  const closeReview = () => {
    setReviewingId(null)
    setReviewPayment(null)
    setReviewScreenshot(null)
    setRejectNote('')
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!reviewingId) return
    setSubmitting(true)

    try {
      const body: { action: string; note?: string } = { action }
      if (action === 'reject' && rejectNote.trim()) {
        body.note = rejectNote.trim()
      }

      const res = await fetch(`/api/admin/payments/${reviewingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Action failed')
      }

      toast.success(
        action === 'approve'
          ? 'Payment approved successfully'
          : 'Payment rejected'
      )
      closeReview()
      fetchPayments()
    } catch (error) {
      console.error('[AdminPayments] Action failed:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to process payment'
      )
    } finally {
      setSubmitting(false)
    }
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
  ]

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Payment Reviews"
        showBackButton={true}
        backButtonText="Back to Admin"
        backButtonHref="/admin"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-gray-700" />
            Payment Reviews
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage payment submissions
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
          <span>{total} total payment{total !== 1 ? 's' : ''}</span>
          {pendingCount !== null && (
            <span className="text-yellow-700 font-medium">
              {pendingCount} pending
            </span>
          )}
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
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : payments.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-white rounded-lg border">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No payments found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter !== 'ALL'
                ? `No ${filter.toLowerCase()} payments`
                : 'No payments have been submitted yet'}
            </p>
          </div>
        ) : (
          /* Payment cards */
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-lg border shadow-sm p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: user info + details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {payment.user.name || 'Unknown User'}
                      </h3>
                      <Badge
                        className={statusBadgeClass(payment.status)}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-3">
                      {payment.user.email}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Plan:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {payment.plan}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {formatAmount(payment.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>{' '}
                        <span className="text-gray-700">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Show admin note + reviewed date for reviewed payments */}
                    {payment.status !== 'PENDING' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {payment.reviewedAt && (
                          <p className="text-xs text-gray-400">
                            Reviewed: {formatDate(payment.reviewedAt)}
                          </p>
                        )}
                        {payment.adminNote && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Note:</span>{' '}
                            {payment.adminNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: action button */}
                  <div className="flex-shrink-0">
                    {payment.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        onClick={() => openReview(payment)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReview(payment)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
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
            <span className="text-sm text-gray-600">
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

      {/* ─── Review Modal ──────────────────────────────────────────────────── */}
      {reviewingId && reviewPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeReview()
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Review payment"
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Review
              </h2>
              <button
                type="button"
                onClick={closeReview}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User details */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  User Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reviewPayment.user.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reviewPayment.user.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plan</span>
                    <span className="text-sm font-medium text-gray-900">
                      {reviewPayment.plan}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatAmount(reviewPayment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Submitted</span>
                    <span className="text-sm text-gray-700">
                      {formatDate(reviewPayment.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={statusBadgeClass(reviewPayment.status)}>
                      {reviewPayment.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Payment Screenshot
                </h3>
                <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[200px] flex items-center justify-center">
                  {loadingScreenshot ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Loading screenshot...
                      </span>
                    </div>
                  ) : reviewScreenshot ? (
                    <img
                      src={reviewScreenshot}
                      alt="Payment screenshot"
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                      <span className="text-sm text-gray-400">
                        No screenshot available
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviewed info for non-pending */}
              {reviewPayment.status !== 'PENDING' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Review Info
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {reviewPayment.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Reviewed At
                        </span>
                        <span className="text-sm text-gray-700">
                          {formatDate(reviewPayment.reviewedAt)}
                        </span>
                      </div>
                    )}
                    {reviewPayment.adminNote && (
                      <div>
                        <span className="text-sm text-gray-600">
                          Admin Note
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {reviewPayment.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons for pending payments */}
              {reviewPayment.status === 'PENDING' && (
                <div className="space-y-4">
                  {/* Reject note */}
                  <div>
                    <label
                      htmlFor="reject-note"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Note (optional, shown to user on rejection)
                    </label>
                    <textarea
                      id="reject-note"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Reason for rejection..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAction('approve')}
                      disabled={submitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleAction('reject')}
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Close button for reviewed payments */}
              {reviewPayment.status !== 'PENDING' && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={closeReview}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
