'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaymentUser {
  name: string
  email: string
}

export interface Payment {
  id: string
  plan: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
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

export type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IQ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' IQD'
}

export function statusBadgeClass(status: Payment['status']) {
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

interface PaymentItemProps {
  payment: Payment
  onReview: (payment: Payment) => void
}

export function PaymentItem({ payment, onReview }: PaymentItemProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: user info + details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {payment.user.name || 'Unknown User'}
            </h3>
            <Badge className={statusBadgeClass(payment.status)}>
              {payment.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate mb-3">
            {payment.user.email}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
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
