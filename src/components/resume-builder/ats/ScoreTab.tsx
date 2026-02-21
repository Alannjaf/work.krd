'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Target, CheckCircle, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { ATS_SCORE_THRESHOLDS } from '@/lib/ats-utils'

type SectionType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications' | 'general'

const SECTION_INDEX_MAP: Record<SectionType, number> = {
  personal: 0,
  summary: 1,
  experience: 2,
  education: 3,
  skills: 4,
  languages: 4,
  projects: 5,
  certifications: 5,
  general: 0,
}

export interface ATSScoreResult {
  score: number
  issues: Array<{ type: string; severity: 'high' | 'medium' | 'low'; message: string; suggestion: string; section?: SectionType }>
  strengths: string[]
  suggestions: string[]
  usage: { used: number; limit: number }
}

// Shared score color helpers using constants (Issue #18)
export function getScoreColor(score: number) {
  if (score >= ATS_SCORE_THRESHOLDS.GOOD) return 'text-green-600'
  if (score >= ATS_SCORE_THRESHOLDS.MODERATE) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBgColor(score: number) {
  if (score >= ATS_SCORE_THRESHOLDS.GOOD) return 'bg-green-100'
  if (score >= ATS_SCORE_THRESHOLDS.MODERATE) return 'bg-yellow-100'
  return 'bg-red-100'
}

function getSeverityIcon(severity: 'high' | 'medium' | 'low') {
  switch (severity) {
    case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'low': return <AlertCircle className="h-4 w-4 text-blue-500" />
  }
}

// Loading skeleton (Issue #17)
function ScoreLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="text-center p-8 rounded-xl bg-gray-100">
        <div className="h-16 w-20 bg-gray-200 rounded mx-auto" />
        <div className="h-5 w-40 bg-gray-200 rounded mx-auto mt-3" />
      </div>
      <div>
        <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
      <div>
        <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
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
  onNavigateToSection?: (sectionIndex: number) => void
  onClose: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

export function ScoreTab({ result, isAnalyzing, canUseATS, onAnalyze, onNavigateToSection, onClose, t, isRTL }: ScoreTabProps) {
  const handleIssueClick = (section?: SectionType) => {
    // Disable navigation for general issues (Issue #15)
    if (section && section !== 'general' && onNavigateToSection) {
      const sectionIndex = SECTION_INDEX_MAP[section]
      onClose()
      setTimeout(() => {
        onNavigateToSection(sectionIndex)
      }, 100)
    }
  }

  // Show loading skeleton during analysis (Issue #17)
  if (isAnalyzing) {
    return <ScoreLoadingSkeleton />
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('pages.resumeBuilder.ats.score.emptyTitle')}</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {t('pages.resumeBuilder.ats.score.emptyDescription')}
        </p>
        <Button onClick={onAnalyze} disabled={!canUseATS}>
          <Target className="h-4 w-4 me-2" />
          {t('pages.resumeBuilder.ats.score.analyzeButton')}
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
              // Disable edit CTA for general issues (Issue #15)
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
