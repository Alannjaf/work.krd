'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  detail?: string
  itemCount?: number
  onConfirm: () => void
  onCancel: () => void
  confirming?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  detail,
  itemCount,
  onConfirm,
  onCancel,
  confirming = false,
}: DeleteConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus cancel button on open, trap escape
  useEffect(() => {
    if (!isOpen) return
    cancelRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
            {detail && (
              <p className="mt-1 text-sm text-gray-500">{detail}</p>
            )}
            {itemCount && itemCount > 1 && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {itemCount} items will be deleted
              </p>
            )}
            <p className="mt-3 text-xs text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            ref={cancelRef}
            variant="outline"
            onClick={onCancel}
            disabled={confirming}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={confirming}
            className="bg-red-600 hover:bg-red-700 text-white"
            type="button"
          >
            {confirming ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
