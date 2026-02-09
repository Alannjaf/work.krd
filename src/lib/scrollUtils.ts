/**
 * Scroll utility functions for reliable scroll-to-top functionality
 * Handles timing issues, async operations, and browser compatibility
 */

export interface ScrollOptions {
  behavior?: 'smooth' | 'auto'
  delay?: number
  maxRetries?: number
  validateScroll?: boolean
}

/**
 * Robust scroll to top function with multiple fallback strategies
 */
export async function scrollToTop(options: ScrollOptions = {}): Promise<void> {
  const {
    behavior = 'smooth',
    delay = 100,
    maxRetries = 3,
    validateScroll = true
  } = options

  // Helper function to perform the actual scroll
  const performScroll = (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // Method 1: Standard window.scrollTo
        window.scrollTo({ top: 0, behavior })
        
        // Method 2: Direct scrollTop assignment (fallback)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        
        // Method 3: Use scrollIntoView on body (additional fallback)
        document.body.scrollIntoView({ behavior, block: 'start' })
        
        resolve(true)
      } catch (error) {
        console.error('[ScrollUtils] Scroll attempt failed:', error);
        resolve(false)
      }
    })
  }

  // Helper function to check if we're at the top
  const isAtTop = (): boolean => {
    return window.pageYOffset === 0 || 
           document.documentElement.scrollTop === 0 || 
           document.body.scrollTop === 0
  }

  // Wait for any pending DOM updates
  await new Promise(resolve => requestAnimationFrame(resolve))
  
  // Add initial delay to allow component mounting/unmounting
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Perform scroll with retries
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await performScroll()
    
    // If validation is disabled, assume success
    if (!validateScroll) {
      break
    }
    
    // Wait a bit for smooth scroll to complete
    if (behavior === 'smooth') {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Check if we successfully scrolled to top
    if (isAtTop()) {
      break
    }
    
    // If not the last attempt, wait before retrying
    if (attempt < maxRetries) {
      // Scroll attempt failed, retrying
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Use 'auto' behavior for retries to ensure immediate scroll
      if (attempt > 1) {
        window.scrollTo({ top: 0, behavior: 'auto' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }
    }
  }
  
  // Final validation
  if (validateScroll && !isAtTop()) {
    // Scroll to top may have failed after all attempts
  }
}

/**
 * Scroll to top with minimal delay - for immediate response
 */
export function scrollToTopImmediate(): void {
  window.scrollTo({ top: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

/**
 * Scroll to top optimized for section changes in forms
 */
export async function scrollToTopForSectionChange(): Promise<void> {
  // Use longer delay to account for component mounting/unmounting
  await scrollToTop({
    behavior: 'smooth',
    delay: 150,
    maxRetries: 2,
    validateScroll: true
  })
}

/**
 * Scroll to top after async operations (like auto-save or translation)
 */
export async function scrollToTopAfterAsync(): Promise<void> {
  // Wait for React state updates and async operations to complete
  await new Promise(resolve => setTimeout(resolve, 50))
  
  await scrollToTop({
    behavior: 'smooth',
    delay: 100,
    maxRetries: 2,
    validateScroll: false // Don't validate since async operations might still be running
  })
}