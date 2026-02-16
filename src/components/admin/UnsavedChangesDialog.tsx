'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface UnsavedChangesDialogProps {
  open: boolean
  onCancel: () => void
  onDiscard: () => void
}

export function UnsavedChangesDialog({ open, onCancel, onDiscard }: UnsavedChangesDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-dialog-title"
      aria-describedby="unsaved-dialog-desc"
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <h2 id="unsaved-dialog-title" className="text-lg font-semibold text-gray-900">
            Unsaved Changes
          </h2>
        </div>
        <p id="unsaved-dialog-desc" className="text-sm text-gray-600 mb-6">
          You have unsaved changes in System Settings. Are you sure you want to leave? Your changes will be lost.
        </p>
        <div className="flex justify-end gap-3">
          <Button ref={cancelRef} variant="outline" onClick={onCancel}>
            Keep Editing
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            Discard Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
