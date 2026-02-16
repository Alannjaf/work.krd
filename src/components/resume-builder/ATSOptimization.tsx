'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Target, FileSearch, Crown } from 'lucide-react'
import { ResumeData } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import { ScoreTab, type ATSScoreResult } from './ats/ScoreTab'
import { KeywordsTab, type KeywordMatchResult } from './ats/KeywordsTab'
import toast from 'react-hot-toast'

/** Callback for reporting ATS usage changes back to the parent */
type ATSUsageUpdateCallback = (used: number, limit: number) => void

interface ATSOptimizationProps {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData
  canUseATS: boolean
  atsLimit: number
  atsUsed: number
  onNavigateToSection?: (sectionIndex: number) => void
  onUsageUpdate?: ATSUsageUpdateCallback
}

export function ATSOptimization({
  isOpen,
  onClose,
  resumeData,
  canUseATS,
  atsLimit,
  atsUsed,
  onNavigateToSection,
  onUsageUpdate
}: ATSOptimizationProps) {
  const { t, isRTL } = useLanguage()
  const [activeTab, setActiveTab] = useState<'score' | 'keywords'>('score')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scoreResult, setScoreResult] = useState<ATSScoreResult | null>(null)
  const [keywordResult, setKeywordResult] = useState<KeywordMatchResult | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [localUsed, setLocalUsed] = useState(atsUsed)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Client-side cache: track resume data hash to invalidate (Issue #16)
  const resumeHashRef = useRef<string>('')

  // Sync localUsed with props
  useEffect(() => {
    setLocalUsed(atsUsed)
  }, [atsUsed])

  // Invalidate cache when resume data changes (Issue #16)
  useEffect(() => {
    const hash = JSON.stringify({
      p: resumeData.personal?.fullName,
      s: resumeData.summary?.slice(0, 50),
      e: resumeData.experience?.length,
      ed: resumeData.education?.length,
      sk: resumeData.skills?.length,
    })
    if (resumeHashRef.current && resumeHashRef.current !== hash) {
      setScoreResult(null)
      setKeywordResult(null)
    }
    resumeHashRef.current = hash
  }, [resumeData])

  // Accessibility: Escape key handler + focus trap (Issue #13)
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return
        const first = focusableElements[0]
        const last = focusableElements[focusableElements.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Focus first focusable element in modal
    requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [isOpen, onClose])

  const handleUsageUpdate = useCallback((usage: { used: number; limit: number }) => {
    setLocalUsed(usage.used)
    onUsageUpdate?.(usage.used, usage.limit)
  }, [onUsageUpdate])

  const analyzeScore = async () => {
    if (!canUseATS) {
      toast.error(t('pages.resumeBuilder.ats.score.limitReached'))
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData })
      })

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(t('pages.resumeBuilder.ats.toast.rateLimited'))
          return
        }
        if (response.status === 403) {
          toast.error(t('pages.resumeBuilder.ats.score.limitReached'))
          return
        }
        throw new Error('Failed to analyze')
      }

      const result = await response.json()
      setScoreResult(result)
      // Update usage in UI (Issue #3)
      if (result.usage) {
        handleUsageUpdate(result.usage)
      }
      toast.success(t('pages.resumeBuilder.ats.toast.scoreSuccess'))
    } catch {
      toast.error(t('pages.resumeBuilder.ats.toast.scoreFailed'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const matchKeywords = async () => {
    if (!canUseATS) {
      toast.error(t('pages.resumeBuilder.ats.score.limitReached'))
      return
    }

    if (jobDescription.trim().length < 50) {
      toast.error(t('pages.resumeBuilder.ats.keywords.minChars'))
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ats/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription })
      })

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(t('pages.resumeBuilder.ats.toast.rateLimited'))
          return
        }
        if (response.status === 403) {
          toast.error(t('pages.resumeBuilder.ats.score.limitReached'))
          return
        }
        throw new Error('Failed to match keywords')
      }

      const result = await response.json()
      setKeywordResult(result)
      // Update usage in UI (Issue #3)
      if (result.usage) {
        handleUsageUpdate(result.usage)
      }
      toast.success(t('pages.resumeBuilder.ats.toast.keywordSuccess'))
    } catch {
      toast.error(t('pages.resumeBuilder.ats.toast.keywordFailed'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-label={t('pages.resumeBuilder.ats.title')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={modalRef} className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('pages.resumeBuilder.ats.title')}</h2>
              <p className="text-sm text-gray-500">
                {atsLimit === -1 ? t('pages.resumeBuilder.ats.subtitleUnlimited') : t('pages.resumeBuilder.ats.subtitle', { used: localUsed, limit: atsLimit })}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Upgrade Banner */}
        {!canUseATS && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5" />
                <div>
                  <p className="font-semibold">{t('pages.resumeBuilder.ats.upgrade.title')}</p>
                  <p className="text-sm opacity-90">{t('pages.resumeBuilder.ats.upgrade.description')}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-orange-600 hover:bg-gray-100"
                onClick={() => window.open('/billing', '_blank')}
              >
                {t('pages.resumeBuilder.ats.upgrade.button')}
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b" role="tablist" aria-label={t('pages.resumeBuilder.ats.title')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'score'}
            aria-controls="ats-score-panel"
            onClick={() => setActiveTab('score')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'score'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="h-4 w-4" />
            {t('pages.resumeBuilder.ats.tabs.score')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'keywords'}
            aria-controls="ats-keywords-panel"
            onClick={() => setActiveTab('keywords')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'keywords'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileSearch className="h-4 w-4" />
            {t('pages.resumeBuilder.ats.tabs.keywords')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'score' ? (
            <div id="ats-score-panel" role="tabpanel">
              <ScoreTab
                result={scoreResult}
                isAnalyzing={isAnalyzing}
                canUseATS={canUseATS}
                onAnalyze={analyzeScore}
                onNavigateToSection={onNavigateToSection}
                onClose={onClose}
                t={t}
                isRTL={isRTL}
              />
            </div>
          ) : (
            <div id="ats-keywords-panel" role="tabpanel">
              <KeywordsTab
                result={keywordResult}
                isAnalyzing={isAnalyzing}
                canUseATS={canUseATS}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                onMatch={matchKeywords}
                onNavigateToSection={onNavigateToSection}
                onClose={onClose}
                t={t}
                isRTL={isRTL}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
