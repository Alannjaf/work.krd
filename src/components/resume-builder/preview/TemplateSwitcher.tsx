'use client'

import { useState, useRef, useEffect } from 'react'
import { Palette, Check, Lock } from 'lucide-react'
import { templateRegistry } from '@/components/html-templates/registry'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface TemplateSwitcherProps {
  selectedTemplate: string
  onTemplateChange: (templateId: string) => void
}

export function TemplateSwitcher({ selectedTemplate, onTemplateChange }: TemplateSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { availableTemplates } = useSubscription()

  const templates = Object.values(templateRegistry)
  const currentTemplate = templateRegistry[selectedTemplate] || templates[0]

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={popoverRef} className="absolute bottom-6 right-6 z-10">
      {/* Expanded popover - grows upward */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl border border-gray-200 shadow-xl p-3 min-w-[280px]">
          <div className="text-xs font-medium text-gray-500 mb-2 px-1">Choose Template</div>
          <div className="grid grid-cols-3 gap-2">
            {templates.map(template => {
              const isActive = template.id === selectedTemplate
              const isLocked = !availableTemplates.includes(template.id)

              return (
                <button
                  key={template.id}
                  onClick={() => onTemplateChange(template.id)}
                  className={`relative flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Mini thumbnail placeholder */}
                  <div className="w-[72px] h-[96px] bg-gray-100 rounded border border-gray-200 mb-1.5 flex items-center justify-center">
                    <Palette className="h-4 w-4 text-gray-300" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 truncate w-full text-center">
                    {template.name}
                  </span>

                  {/* Active check */}
                  {isActive && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}

                  {/* Lock badge */}
                  {isLocked && (
                    <div className="absolute top-1 left-1 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center">
                      <Lock className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Collapsed pill button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 border border-gray-200 hover:shadow-xl transition-shadow text-sm font-medium text-gray-700"
      >
        <Palette className="h-4 w-4 text-gray-500" />
        {currentTemplate?.name || 'Template'}
      </button>
    </div>
  )
}
