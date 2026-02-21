'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { FileSearch, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { getScoreColor, getScoreBgColor } from './ScoreTab'

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

export interface KeywordMatchResult {
  matchScore: number
  matchedKeywords: Array<{ keyword: string; found: boolean; importance: 'critical' | 'important' | 'nice-to-have' }>
  missingKeywords: Array<{ keyword: string; importance: 'critical' | 'important' | 'nice-to-have'; suggestion: string; section?: SectionType }>
  suggestions: string[]
  usage: { used: number; limit: number }
}

// Default case for importance badge (Issue #14)
function getImportanceBadge(importance: string, t: (key: string) => string) {
  switch (importance) {
    case 'critical':
      return <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">{t('pages.resumeBuilder.ats.importance.critical')}</span>
    case 'important':
      return <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">{t('pages.resumeBuilder.ats.importance.important')}</span>
    case 'nice-to-have':
      return <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">{t('pages.resumeBuilder.ats.importance.niceToHave')}</span>
    default:
      return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{importance}</span>
  }
}

// Loading skeleton (Issue #17)
function KeywordsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="text-center p-6 rounded-xl bg-gray-100">
        <div className="h-14 w-20 bg-gray-200 rounded mx-auto" />
        <div className="h-5 w-40 bg-gray-200 rounded mx-auto mt-3" />
      </div>
      <div>
        <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 w-24 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>
      <div>
        <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
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
  onNavigateToSection?: (sectionIndex: number) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

export function KeywordsTab({
  result,
  isAnalyzing,
  canUseATS,
  jobDescription,
  setJobDescription,
  onMatch,
  onNavigateToSection,
  t,
  isRTL
}: KeywordsTabProps) {
  const handleKeywordClick = (section?: SectionType) => {
    if (section && section !== 'general' && onNavigateToSection) {
      onNavigateToSection(SECTION_INDEX_MAP[section])
    }
  }

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div>
        <label htmlFor="ats-job-description" className="block text-sm font-medium text-gray-700 mb-2">
          {t('pages.resumeBuilder.ats.keywords.pasteLabel')}
        </label>
        <textarea
          id="ats-job-description"
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

      {/* Loading skeleton (Issue #17) */}
      {isAnalyzing && <KeywordsLoadingSkeleton />}

      {/* Results */}
      {result && !isAnalyzing && (
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
                    {getImportanceBadge(keyword.importance, t)}
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
                  // Disable navigation for general issues (Issue #15)
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
                          {getImportanceBadge(keyword.importance, t)}
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
