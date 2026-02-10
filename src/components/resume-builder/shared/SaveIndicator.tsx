'use client'

import { Check, Loader2 } from 'lucide-react'

interface SaveIndicatorProps {
  isSaving: boolean
  className?: string
}

export function SaveIndicator({ isSaving, className = '' }: SaveIndicatorProps) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          <span className="text-gray-500">Saving...</span>
        </>
      ) : (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-gray-500">Saved</span>
        </>
      )}
    </div>
  )
}
