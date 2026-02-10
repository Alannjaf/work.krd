'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CollapsibleEntryProps {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  onRemove: () => void
  children: React.ReactNode
}

export function CollapsibleEntry({ title, subtitle, defaultOpen = true, onRemove, children }: CollapsibleEntryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div
        className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />

        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title || 'Untitled'}</p>
          {subtitle && !isOpen && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}
