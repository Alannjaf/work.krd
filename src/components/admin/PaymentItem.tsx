'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import { formatAdminDate, formatAdminDateFull } from '@/lib/admin-utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaymentUser {
  name: string
  email: string
}

export interface Payment {
  id: string
  plan: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED'
  createdAt: string
  reviewedAt: string | null
  adminNote: string | null
  user: PaymentUser
}

export interface PaymentsResponse {
  payments: Payment[]
  total: number
  page: number
  limit: number
}

export type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED'

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IQ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' IQD'
}

export function statusBadgeClass(status: Payment['status']) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
    case 'REFUNDED':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800'
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface PaymentItemProps {
  payment: Payment
  onReview: (payment: Payment) => void
}

export function PaymentItem({ payment, onReview }: PaymentItemProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: user info + details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {payment.user.name || 'Unknown User'}
            </h3>
            <Badge className={statusBadgeClass(payment.status)}>
              {payment.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">
            {payment.user.email}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Plan:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {payment.plan}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Amount:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatAmount(payment.amount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300" title={formatAdminDateFull(payment.createdAt)}>
                {formatAdminDate(payment.createdAt)}
              </span>
            </div>
          </div>

          {/* Show admin note + reviewed date for reviewed payments */}
          {payment.status !== 'PENDING' && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {payment.reviewedAt && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Reviewed: <span title={formatAdminDateFull(payment.reviewedAt)}>{formatAdminDate(payment.reviewedAt)}</span>
                </p>
              )}
              {payment.adminNote && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">Note:</span>{' '}
                  {payment.adminNote}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: action button */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          {payment.status === 'PENDING' ? (
            <Button
              size="sm"
              onClick={() => onReview(payment)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Eye className="h-4 w-4" />
              Review
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(payment)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
