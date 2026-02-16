'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { Check, X, Loader2, ImageIcon, RotateCcw } from 'lucide-react'
import { type Payment, formatAmount, statusBadgeClass } from './PaymentItem'
import { devError, formatAdminDate } from '@/lib/admin-utils'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()
  const [reviewScreenshot, setReviewScreenshot] = useState<string | null>(null)
  const [loadingScreenshot, setLoadingScreenshot] = useState(true)
  const [rejectNote, setRejectNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [refunding, setRefunding] = useState(false)

  // Load screenshot on mount
  useEffect(() => {
    let cancelled = false

    async function loadScreenshot() {
      try {
        const res = await csrfFetch(`/api/admin/payments/${payment.id}/review`)
        if (!res.ok) throw new Error('Failed to load payment details')
        const data: { screenshot?: string } = await res.json()
        if (!cancelled) {
          setReviewScreenshot(data.screenshot || null)
        }
      } catch (error) {
        devError('[PaymentApprovalForm] Failed to load review:', error)
        if (!cancelled) {
          toast.error(t('pages.admin.payments.screenshotLoadFailed'))
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
      if (!window.confirm(t('pages.admin.payments.approveConfirm'))) return
    } else {
      if (!window.confirm(t('pages.admin.payments.rejectConfirm'))) return
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
          ? t('pages.admin.payments.approveSuccess')
          : t('pages.admin.payments.rejectSuccess')
      )
      onClose()
      onActionComplete()
    } catch (error) {
      devError('[PaymentApprovalForm] Action failed:', error)
      toast.error(
        error instanceof Error ? error.message : t('pages.admin.payments.actionFailed')
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Refund handler ──────────────────────────────────────────────────

  const handleRefund = async () => {
    if (!window.confirm(t('pages.admin.payments.refundConfirm'))) return

    setRefunding(true)
    try {
      const body: { note?: string } = {}
      if (rejectNote.trim()) {
        body.note = rejectNote.trim()
      }

      const res = await csrfFetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Refund failed')
      }

      toast.success(t('pages.admin.payments.refundSuccess'))
      onClose()
      onActionComplete()
    } catch (error) {
      devError('[PaymentApprovalForm] Refund failed:', error)
      toast.error(
        error instanceof Error ? error.message : t('pages.admin.payments.refundFailed')
      )
    } finally {
      setRefunding(false)
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
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Review payment"
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('pages.admin.payments.paymentReview')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('pages.admin.payments.userDetails')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.payments.name')}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {payment.user.name || t('pages.admin.payments.unknownUser')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.payments.email')}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {payment.user.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.payments.planLabel')}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {payment.plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.payments.amountLabel')}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatAmount(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.payments.submitted')}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatAdminDate(payment.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('pages.admin.payments.status')}</span>
                <Badge className={statusBadgeClass(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Screenshot */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('pages.admin.payments.screenshot')}
            </h3>
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 min-h-[200px] flex items-center justify-center">
              {loadingScreenshot ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {t('pages.admin.payments.loadingScreenshot')}
                  </span>
                </div>
              ) : reviewScreenshot ? (
                <img
                  src={reviewScreenshot}
                  alt={t('pages.admin.payments.paymentScreenshot')}
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <ImageIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {t('pages.admin.payments.noScreenshot')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reviewed info for non-pending */}
          {payment.status !== 'PENDING' && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('pages.admin.payments.reviewInfo')}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                {payment.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.admin.payments.reviewedAt')}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatAdminDate(payment.reviewedAt)}
                    </span>
                  </div>
                )}
                {payment.adminNote && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.admin.payments.adminNote')}
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
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
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('pages.admin.payments.rejectNoteLabel')}
                </label>
                <textarea
                  id="reject-note"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder={t('pages.admin.payments.rejectNotePlaceholder')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
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
                  {t('pages.admin.payments.approve')}
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
                  {t('pages.admin.payments.reject')}
                </Button>
              </div>
            </div>
          )}

          {/* Close button (+ refund for approved) for reviewed payments */}
          {payment.status !== 'PENDING' && (
            <div className="space-y-4">
              {payment.status === 'APPROVED' && (
                <div>
                  <label
                    htmlFor="refund-note"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {t('pages.admin.payments.refundNoteLabel')}
                  </label>
                  <textarea
                    id="refund-note"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder={t('pages.admin.payments.refundNotePlaceholder')}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                {payment.status === 'APPROVED' && (
                  <Button
                    onClick={handleRefund}
                    disabled={refunding}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {refunding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    {t('pages.admin.payments.refund')}
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  {t('pages.admin.payments.close')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
