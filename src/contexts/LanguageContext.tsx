'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Language = 'en' | 'ar' | 'ckb'

interface TranslationVariables {
  [key: string]: string | number
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, variables?: TranslationVariables) => string
  isRTL: boolean
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Import translation files
const translations = {
  en: () => import('@/locales/en/common.json').then(m => m.default),
  ar: () => import('@/locales/ar/common.json').then(m => m.default),
  ckb: () => import('@/locales/ckb/common.json').then(m => m.default)}

// Pre-import English translations for faster initial load
import enTranslations from '@/locales/en/common.json'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [messages, setMessages] = useState<Record<string, unknown>>(enTranslations)
  const [isLoading, setIsLoading] = useState(false)

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      // Skip loading for English since it's pre-loaded
      if (language === 'en') {
        setMessages(enTranslations)
        return
      }
      
      setIsLoading(true)
      try {
        const translationLoader = translations[language]
        const loadedMessages = await translationLoader()
        setMessages(loadedMessages)
      } catch (error) {
        console.error('[LanguageContext] Failed to load translations:', error);
        // Fallback to English on error
        setMessages(enTranslations)
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  // Translation function that supports nested keys and variable interpolation
  const t = (key: string, variables?: TranslationVariables): string => {
    const keys = key.split('.')
    let value: unknown = messages
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    let result = typeof value === 'string' ? value : key
    
    // Replace variables if provided
    if (variables && typeof result === 'string') {
      Object.entries(variables).forEach(([variableKey, variableValue]) => {
        const placeholder = `{${variableKey}}`
        result = result.replace(new RegExp(placeholder, 'g'), String(variableValue))
      })
    }
    
    return result
  }

  const isRTL = language === 'ar' || language === 'ckb'

  // Update document direction when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
      document.documentElement.lang = language
    }
  }, [language, isRTL])


  const value = {
    language,
    setLanguage,
    t,
    isRTL,
    isLoading
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}