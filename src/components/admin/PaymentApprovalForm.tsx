'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { Check, X, Loader2, ImageIcon } from 'lucide-react'
import { type Payment, formatDate, formatAmount, statusBadgeClass } from './PaymentItem'
import { devError } from '@/lib/admin-utils'

// ─── Component ──────────────────────────────────────────────────────────────

interface PaymentApprovalFormProps {
  payment: Payment
  csrfFetch: (url: string, options?: RequestInit) => Promise<Response>
  onClose: () => void
  onActionComplete: () => void
}

export function PaymentApprovalForm({
  payment,
  csrfFetch,
  onClose,
  onActionComplete,
}: PaymentApprovalFormProps) {
  const [reviewScreenshot, setReviewScreenshot] = useState<string | null>(null)
  const [loadingScreenshot, setLoadingScreenshot] = useState(true)
  const [rejectNote, setRejectNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load screenshot on mount
  useEffect(() => {
    let cancelled = false

    async function loadScreenshot() {
      try {
        const res = await csrfFetch(`/api/admin/payments/${payment.id}/review`)
        if (!res.ok) throw new Error('Failed to load payment details')
        const data = await res.json()
        if (!cancelled) {
          setReviewScreenshot(data.screenshot || null)
        }
      } catch (error) {
        devError('[PaymentApprovalForm] Failed to load review:', error)
        if (!cancelled) {
          toast.error('Failed to load screenshot')
        }
      } finally {
        if (!cancelled) {
          setLoadingScreenshot(false)
        }
      }
    }

    loadScreenshot()
    return () => { cancelled = true }
  }, [payment.id, csrfFetch])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // ─── Action handler ───────────────────────────────────────────────────

  const handleAction = async (action: 'approve' | 'reject') => {
    if (action === 'approve') {
      if (!window.confirm('Are you sure you want to approve this payment? This will activate the user\'s subscription.')) return
    } else {
      if (!window.confirm('Are you sure you want to reject this payment?')) return
    }

    setSubmitting(true)

    try {
      const body: { action: string; note?: string } = { action }
      if (action === 'reject' && rejectNote.trim()) {
        body.note = rejectNote.trim()
      }

      const res = await csrfFetch(`/api/admin/payments/${payment.id}/review`, {
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
      onClose()
      onActionComplete()
    } catch (error) {
      devError('[PaymentApprovalForm] Action failed:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to process payment'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
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
            onClick={onClose}
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
                  {payment.user.name || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">
                  {payment.user.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <span className="text-sm font-medium text-gray-900">
                  {payment.plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Submitted</span>
                <span className="text-sm text-gray-700">
                  {formatDate(payment.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={statusBadgeClass(payment.status)}>
                  {payment.status}
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
          {payment.status !== 'PENDING' && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Review Info
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {payment.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Reviewed At
                    </span>
                    <span className="text-sm text-gray-700">
                      {formatDate(payment.reviewedAt)}
                    </span>
                  </div>
                )}
                {payment.adminNote && (
                  <div>
                    <span className="text-sm text-gray-600">
                      Admin Note
                    </span>
                    <p className="text-sm text-gray-900 mt-1">
                      {payment.adminNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons for pending payments */}
          {payment.status === 'PENDING' && (
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
          {payment.status !== 'PENDING' && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
