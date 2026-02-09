'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface AISuggestionButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  onClick: () => Promise<void>
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function AISuggestionButton({ 
  variant = 'default',
  size = 'default',
  onClick,
  children,
  disabled = false,
  className = ''
}: AISuggestionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const handleClick = async () => {
    if (isLoading || disabled) return
    
    setIsLoading(true)
    try {
      await onClick()
    } catch (error) {
      console.error('[AISuggestionButton] AI suggestion failed:', error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`${className} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          {t('ai.generating')}
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
          {children}
        </>
      )}
    </Button>
  )
}