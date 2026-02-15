'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Target, FileSearch, CheckCircle, AlertCircle, AlertTriangle, Loader2, Crown, ArrowRight } from 'lucide-react'
import { ResumeData } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

type SectionType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications' | 'general'

// Map section names to form section indices
const SECTION_INDEX_MAP: Record<SectionType, number> = {
  personal: 0,
  summary: 1,
  experience: 2,
  education: 3,
  skills: 4,
  languages: 4,
  projects: 5,
  certifications: 5,
  general: 0 // Default to personal for general issues
}

interface ATSOptimizationProps {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData
  canUseATS: boolean
  atsLimit: number
  atsUsed: number
  onNavigateToSection?: (sectionIndex: number) => void
}

interface ATSScoreResult {
  score: number
  issues: Array<{ type: string; severity: 'high' | 'medium' | 'low'; message: string; suggestion: string; section?: SectionType }>
  strengths: string[]
  suggestions: string[]
  usage: { used: number; limit: number }
}

interface KeywordMatchResult {
  matchScore: number
  matchedKeywords: Array<{ keyword: string; found: boolean; importance: 'critical' | 'important' | 'nice-to-have' }>
  missingKeywords: Array<{ keyword: string; importance: 'critical' | 'important' | 'nice-to-have'; suggestion: string; section?: SectionType }>
  suggestions: string[]
  usage: { used: number; limit: number }
}

export function ATSOptimization({
  isOpen,
  onClose,
  resumeData,
  canUseATS,
  atsLimit,
  atsUsed,
  onNavigateToSection
}: ATSOptimizationProps) {
  const { t, isRTL } = useLanguage()
  const [activeTab, setActiveTab] = useState<'score' | 'keywords'>('score')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scoreResult, setScoreResult] = useState<ATSScoreResult | null>(null)
  const [keywordResult, setKeywordResult] = useState<KeywordMatchResult | null>(null)
  const [jobDescription, setJobDescription] = useState('')

  if (!isOpen) return null

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
      toast.success(t('pages.resumeBuilder.ats.toast.keywordSuccess'))
    } catch {
      toast.error(t('pages.resumeBuilder.ats.toast.keywordFailed'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low': return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getImportanceBadge = (importance: 'critical' | 'important' | 'nice-to-have') => {
    switch (importance) {
      case 'critical':
        return <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">{t('pages.resumeBuilder.ats.importance.critical')}</span>
      case 'important':
        return <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">{t('pages.resumeBuilder.ats.importance.important')}</span>
      case 'nice-to-have':
        return <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">{t('pages.resumeBuilder.ats.importance.niceToHave')}</span>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('pages.resumeBuilder.ats.title')}</h2>
              <p className="text-sm text-gray-500">
                {atsLimit === -1 ? t('pages.resumeBuilder.ats.subtitleUnlimited') : t('pages.resumeBuilder.ats.subtitle', { used: atsUsed, limit: atsLimit })}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
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
        <div className="flex border-b">
          <button
            type="button"
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
            <ScoreTab
              result={scoreResult}
              isAnalyzing={isAnalyzing}
              canUseATS={canUseATS}
              onAnalyze={analyzeScore}
              getScoreColor={getScoreColor}
              getScoreBgColor={getScoreBgColor}
              getSeverityIcon={getSeverityIcon}
              onNavigateToSection={onNavigateToSection}
              onClose={onClose}
              t={t}
              isRTL={isRTL}
            />
          ) : (
            <KeywordsTab
              result={keywordResult}
              isAnalyzing={isAnalyzing}
              canUseATS={canUseATS}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onMatch={matchKeywords}
              getScoreColor={getScoreColor}
              getScoreBgColor={getScoreBgColor}
              getImportanceBadge={getImportanceBadge}
              onNavigateToSection={onNavigateToSection}
              onClose={onClose}
              t={t}
              isRTL={isRTL}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface ScoreTabProps {
  result: ATSScoreResult | null
  isAnalyzing: boolean
  canUseATS: boolean
  onAnalyze: () => void
  getScoreColor: (score: number) => string
  getScoreBgColor: (score: number) => string
  getSeverityIcon: (severity: 'high' | 'medium' | 'low') => React.ReactNode
  onNavigateToSection?: (sectionIndex: number) => void
  onClose: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

function ScoreTab({ result, isAnalyzing, canUseATS, onAnalyze, getScoreColor, getScoreBgColor, getSeverityIcon, onNavigateToSection, onClose, t, isRTL }: ScoreTabProps) {
  const handleIssueClick = (section?: SectionType) => {
    if (section && onNavigateToSection) {
      const sectionIndex = SECTION_INDEX_MAP[section]
      onClose()
      // Small delay to allow modal to close before navigating
      setTimeout(() => {
        onNavigateToSection(sectionIndex)
      }, 100)
    }
  }
  if (!result) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('pages.resumeBuilder.ats.score.emptyTitle')}</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {t('pages.resumeBuilder.ats.score.emptyDescription')}
        </p>
        <Button onClick={onAnalyze} disabled={isAnalyzing || !canUseATS}>
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
              {t('pages.resumeBuilder.ats.score.analyzing')}
            </>
          ) : (
            <>
              <Target className="h-4 w-4 me-2" />
              {t('pages.resumeBuilder.ats.score.analyzeButton')}
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <div className={`text-center p-8 rounded-xl ${getScoreBgColor(result.score)}`}>
        <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
          {result.score}
        </div>
        <div className="text-lg text-gray-600 mt-2">{t('pages.resumeBuilder.ats.score.scoreLabel')}</div>
        <Button onClick={onAnalyze} variant="outline" size="sm" className="mt-4" disabled={isAnalyzing || !canUseATS}>
          {isAnalyzing ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : null}
          {t('pages.resumeBuilder.ats.score.reanalyze')}
        </Button>
      </div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t('pages.resumeBuilder.ats.score.strengths')}
          </h4>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {result.issues.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            {t('pages.resumeBuilder.ats.score.issues')}
          </h4>
          <ul className="space-y-2">
            {result.issues.map((issue, index) => {
              const isClickable = issue.section && issue.section !== 'general' && onNavigateToSection
              return (
                <li
                  key={index}
                  onClick={() => isClickable && handleIssueClick(issue.section)}
                  className={`bg-gray-50 p-3 rounded-lg transition-colors ${
                    isClickable
                      ? 'cursor-pointer hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-gray-200'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                      <p className="text-sm text-gray-600 mt-1">{issue.suggestion}</p>
                    </div>
                    {isClickable && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-medium shrink-0">
                        <span>{t('pages.resumeBuilder.ats.score.edit')}</span>
                        <ArrowRight className={isRTL ? 'h-3 w-3 rotate-180' : 'h-3 w-3'} />
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{t('pages.resumeBuilder.ats.score.suggestions')}</h4>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                <span className="font-medium text-blue-600">{index + 1}.</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface KeywordsTabProps {
  result: KeywordMatchResult | null
  isAnalyzing: boolean
  canUseATS: boolean
  jobDescription: string
  setJobDescription: (value: string) => void
  onMatch: () => void
  getScoreColor: (score: number) => string
  getScoreBgColor: (score: number) => string
  getImportanceBadge: (importance: 'critical' | 'important' | 'nice-to-have') => React.ReactNode
  onNavigateToSection?: (sectionIndex: number) => void
  onClose: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

function KeywordsTab({
  result,
  isAnalyzing,
  canUseATS,
  jobDescription,
  setJobDescription,
  onMatch,
  getScoreColor,
  getScoreBgColor,
  getImportanceBadge,
  onNavigateToSection,
  onClose,
  t,
  isRTL
}: KeywordsTabProps) {
  const handleKeywordClick = (section?: SectionType) => {
    if (section && onNavigateToSection) {
      const sectionIndex = SECTION_INDEX_MAP[section]
      onClose()
      // Small delay to allow modal to close before navigating
      setTimeout(() => {
        onNavigateToSection(sectionIndex)
      }, 100)
    }
  }
  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('pages.resumeBuilder.ats.keywords.pasteLabel')}
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder={t('pages.resumeBuilder.ats.keywords.placeholder')}
          className="w-full h-40 px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {t('pages.resumeBuilder.ats.keywords.charCount', { count: jobDescription.length })}
          </span>
          <Button onClick={onMatch} disabled={isAnalyzing || !canUseATS || jobDescription.length < 50}>
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {t('pages.resumeBuilder.ats.score.analyzing')}
              </>
            ) : (
              <>
                <FileSearch className="h-4 w-4 me-2" />
                {t('pages.resumeBuilder.ats.keywords.matchButton')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Match Score */}
          <div className={`text-center p-6 rounded-xl ${getScoreBgColor(result.matchScore)}`}>
            <div className={`text-5xl font-bold ${getScoreColor(result.matchScore)}`}>
              {result.matchScore}%
            </div>
            <div className="text-lg text-gray-600 mt-2">{t('pages.resumeBuilder.ats.keywords.matchScore')}</div>
          </div>

          {/* Matched Keywords */}
          {result.matchedKeywords.filter(k => k.found).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {t('pages.resumeBuilder.ats.keywords.matched', { count: result.matchedKeywords.filter(k => k.found).length })}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.filter(k => k.found).map((keyword, index) => (
                  <div key={index} className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-sm text-green-700">{keyword.keyword}</span>
                    {getImportanceBadge(keyword.importance)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                {t('pages.resumeBuilder.ats.keywords.missing', { count: result.missingKeywords.length })}
              </h4>
              <ul className="space-y-2">
                {result.missingKeywords.map((keyword, index) => {
                  const isClickable = keyword.section && keyword.section !== 'general' && onNavigateToSection
                  return (
                    <li
                      key={index}
                      onClick={() => isClickable && handleKeywordClick(keyword.section)}
                      className={`bg-red-50 p-3 rounded-lg transition-colors ${
                        isClickable
                          ? 'cursor-pointer hover:bg-red-100 hover:shadow-sm border border-transparent hover:border-red-200'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{keyword.keyword}</span>
                        <div className="flex items-center gap-2">
                          {getImportanceBadge(keyword.importance)}
                          {isClickable && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                              <span>{t('pages.resumeBuilder.ats.keywords.add')}</span>
                              <ArrowRight className={isRTL ? 'h-3 w-3 rotate-180' : 'h-3 w-3'} />
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{keyword.suggestion}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t('pages.resumeBuilder.ats.keywords.suggestions')}</h4>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                    <span className="font-medium text-blue-600">{index + 1}.</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
