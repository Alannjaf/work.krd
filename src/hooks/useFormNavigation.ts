'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'

export interface FormNavigationOptions {
  onNext?: () => void
  onPrevious?: () => void
  onSave?: () => void
  onPreview?: () => void
  currentSection?: number
  totalSections?: number
  disabled?: boolean
}

export function useFormNavigation({
  onNext,
  onPrevious,
  onSave,
  onPreview,
  currentSection,
  totalSections,
  disabled = false
}: FormNavigationOptions) {
  const formRef = useRef<HTMLDivElement>(null)
  const focusTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Memoize selector string to avoid re-creating on every call
  const focusableSelector = useMemo(() => [
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable]:not([contenteditable="false"])'
  ].join(', '), [])

  // Cache focusable elements, invalidate on section change
  const focusableCacheRef = useRef<{ section: number | undefined; elements: HTMLElement[] } | null>(null)

  // Get all focusable elements in the current form section
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!formRef.current) return []

    // Return cached result if section hasn't changed
    if (focusableCacheRef.current && focusableCacheRef.current.section === currentSection) {
      return focusableCacheRef.current.elements
    }

    const elements = Array.from(formRef.current.querySelectorAll(focusableSelector))
      .filter(el => {
        const element = el as HTMLElement
        // Check if element is visible
        const style = window.getComputedStyle(element)
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               element.offsetParent !== null
      }) as HTMLElement[]

    focusableCacheRef.current = { section: currentSection, elements }
    return elements
  }, [currentSection, focusableSelector])

  // Check if current element is the last focusable element
  const isLastFocusableElement = useCallback((element: HTMLElement): boolean => {
    const focusableElements = getFocusableElements()
    return focusableElements.length > 0 && 
           focusableElements[focusableElements.length - 1] === element
  }, [getFocusableElements])

  // Check if current element is the first focusable element
  const isFirstFocusableElement = useCallback((element: HTMLElement): boolean => {
    const focusableElements = getFocusableElements()
    return focusableElements.length > 0 && focusableElements[0] === element
  }, [getFocusableElements])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return

    const target = event.target as HTMLElement
    const isInputElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    
    // Only handle keyboard navigation for input elements or specific keys
    if (!isInputElement && !['Escape', 'F1'].includes(event.key)) return

    switch (event.key) {
      case 'Enter':
        // Prevent default form submission
        event.preventDefault()
        
        if (event.shiftKey) {
          // Shift+Enter: Save form
          onSave?.()
        } else if (event.ctrlKey || event.metaKey) {
          // Ctrl+Enter: Preview
          onPreview?.()
        } else {
          // Regular Enter: Move to next section if on last element
          if (isLastFocusableElement(target) && onNext) {
            onNext()
          } else {
            // Move to next focusable element
            const focusableElements = getFocusableElements()
            const currentIndex = focusableElements.indexOf(target)
            if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
              focusableElements[currentIndex + 1].focus()
            } else if (onNext) {
              // If at last element, move to next section
              onNext()
            }
          }
        }
        break

      case 'ArrowDown':
        // Arrow down on last element in dropdown/select
        if (target.tagName === 'SELECT' && isLastFocusableElement(target)) {
          event.preventDefault()
          onNext?.()
        }
        break

      case 'Tab':
        // Enhanced tab navigation
        if (event.shiftKey) {
          // Shift+Tab: Go to previous element or section
          if (isFirstFocusableElement(target) && onPrevious) {
            event.preventDefault()
            onPrevious()
          }
        } else {
          // Tab: Go to next element or section
          if (isLastFocusableElement(target) && onNext) {
            event.preventDefault()
            onNext()
          }
        }
        break

      case 'Escape':
        // Escape: Go to previous section or close modal
        event.preventDefault()
        onPrevious?.()
        break

      case 'F1':
        // F1: Show help/preview
        event.preventDefault()
        onPreview?.()
        break

      // Number keys for quick section navigation (Ctrl+Number)
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          const sectionNumber = parseInt(event.key) - 1
          if (typeof currentSection === 'number' && 
              typeof totalSections === 'number' && 
              sectionNumber >= 0 && 
              sectionNumber < totalSections && 
              sectionNumber !== currentSection) {
            // Dispatch custom event for section navigation
            const navigationEvent = new CustomEvent('navigate-to-section', {
              detail: { sectionIndex: sectionNumber }
            })
            window.dispatchEvent(navigationEvent)
          }
        }
        break
    }
  }, [disabled, onNext, onPrevious, onSave, onPreview, currentSection, totalSections, 
      isLastFocusableElement, isFirstFocusableElement, getFocusableElements])

  // Add event listener
  useEffect(() => {
    const currentForm = formRef.current
    if (!currentForm) return

    currentForm.addEventListener('keydown', handleKeyDown)
    
    return () => {
      currentForm.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Focus first element when section changes
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      clearTimeout(focusTimerRef.current)
      focusTimerRef.current = setTimeout(() => {
        focusableElements[0].focus()
      }, 100)
    }
  }, [getFocusableElements])

  // Clean up pending focus timer on unmount
  useEffect(() => {
    return () => clearTimeout(focusTimerRef.current)
  }, [])

  return {
    formRef,
    focusFirstElement,
    getFocusableElements
  }
}