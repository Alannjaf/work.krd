'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Tag {
  id: string
  name: string
  meta?: string // level/proficiency
}

interface TagInputProps {
  tags: Tag[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onMetaChange?: (id: string, meta: string) => void
  metaOptions?: string[]
  placeholder?: string
  metaLabel?: string
}

export function TagInput({ tags, onAdd, onRemove, onMetaChange, metaOptions, placeholder = 'Type and press Enter', metaLabel }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [editingMeta, setEditingMeta] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      onAdd(inputValue.trim())
      setInputValue('')
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemove(tags[tags.length - 1].id)
    }
  }

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-white min-h-[44px] cursor-text focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg text-sm group relative"
          >
            <span>{tag.name}</span>
            {tag.meta && metaOptions && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingMeta(editingMeta === tag.id ? null : tag.id)
                }}
                className="text-xs text-gray-500 hover:text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded"
              >
                {tag.meta}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(tag.id)
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Meta dropdown */}
            {editingMeta === tag.id && metaOptions && onMetaChange && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                {metaLabel && (
                  <div className="px-3 py-1 text-xs text-gray-500 font-medium">{metaLabel}</div>
                )}
                {metaOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMetaChange(tag.id, option)
                      setEditingMeta(null)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
                      tag.meta === option ? 'text-primary font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>
    </div>
  )
}
