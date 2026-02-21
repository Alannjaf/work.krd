'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'

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

// Pre-import all locale files at build time — eliminates dynamic import() race conditions
import enTranslations from '@/locales/en/common.json'
import arTranslations from '@/locales/ar/common.json'
import ckbTranslations from '@/locales/ckb/common.json'

const translationCache: Record<Language, Record<string, unknown>> = {
  en: enTranslations,
  ar: arTranslations,
  ckb: ckbTranslations,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [messages, setMessages] = useState<Record<string, unknown>>(enTranslations)
  // isLoading kept for API compat — always false since translations are preloaded
  const isLoading = false

  // Load translations when language changes — synchronous from preloaded cache
  useEffect(() => {
    setMessages(translationCache[language] ?? enTranslations)
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


  const stableT = useCallback((key: string, variables?: TranslationVariables): string => {
    return t(key, variables)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: stableT,
    isRTL,
    isLoading
  }), [language, stableT, isRTL, isLoading, setLanguage])

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