'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface CollapsibleGroupProps {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleGroup({ title, subtitle, defaultOpen = false, children }: CollapsibleGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div>
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {subtitle && <span className="block text-xs text-gray-500 mt-0.5">{subtitle}</span>}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}
