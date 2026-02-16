/**
 * Browser detection and download utilities
 */

export type BrowserType = 'edge' | 'chrome' | 'firefox' | 'safari' | 'unknown'

/**
 * Detects the current browser type based on user agent
 */
export const detectBrowser = (): BrowserType => {
  if (typeof navigator === 'undefined') return 'unknown'
  
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('edg/')) return 'edge'
  if (userAgent.includes('chrome') && !userAgent.includes('edg/')) return 'chrome'
  if (userAgent.includes('firefox')) return 'firefox'
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari'
  return 'unknown'
}

/**
 * Safari-specific download function that forces download by using octet-stream MIME type
 */
export const downloadBlobSafari = (blob: Blob, filename: string): void => {
  const downloadBlob = new Blob([blob], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(downloadBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Cross-browser blob download utility
 * Uses Safari-specific method for Safari, standard approach for others
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  if (typeof document === 'undefined') return
  const browser = detectBrowser()
  
  if (browser === 'safari') {
    downloadBlobSafari(blob, filename)
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

