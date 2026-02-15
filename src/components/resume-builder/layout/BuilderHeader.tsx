'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ScanSearch, Languages, Download, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SaveIndicator } from '@/components/resume-builder/shared/SaveIndicator'
import { useLanguage } from '@/contexts/LanguageContext'

interface BuilderHeaderProps {
  resumeTitle: string
  onTitleChange: (title: string) => void
  titleError: boolean
  isSaving: boolean
  isAutoSaving: boolean
  onSave: () => void
  onShowATS: () => void
  onTranslate?: () => void
  isTranslating?: boolean
  showTranslate?: boolean
  onDownload?: () => void
  isDownloading?: boolean
  onShowKeyboardHelp: () => void
}

export function BuilderHeader({
  resumeTitle,
  onTitleChange,
  titleError,
  isSaving,
  isAutoSaving,
  onSave,
  onShowATS,
  onTranslate,
  isTranslating,
  showTranslate,
  onDownload,
  isDownloading,
  onShowKeyboardHelp,
}: BuilderHeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <header className="h-12 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 gap-3 shrink-0 z-20">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors shrink-0"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-200 shrink-0" />

      {/* Editable title */}
      <input
        type="text"
        value={resumeTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className={`flex-1 min-w-0 text-sm font-medium bg-transparent border-0 outline-none focus:ring-0 px-1 py-0.5 rounded hover:bg-gray-50 focus:bg-gray-50 transition-colors truncate ${
          titleError ? 'text-red-600 placeholder-red-400' : 'text-gray-900'
        }`}
        placeholder="Untitled Resume"
      />

      {/* Save indicator */}
      <SaveIndicator isSaving={isSaving || isAutoSaving} className="shrink-0 hidden sm:flex" />

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onShowKeyboardHelp}
          className="h-8 w-8 p-0 hidden sm:flex"
          title="Keyboard Shortcuts (F1)"
        >
          <Keyboard className="h-4 w-4 text-gray-500" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onShowATS}
          className="h-8 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-1"
          title={t('pages.resumeBuilder.actions.atsOptimization')}
        >
          <ScanSearch className="h-4 w-4 shrink-0" />
          <span className="text-[11px] font-medium leading-tight sm:text-xs">{t('pages.resumeBuilder.actions.ats')}</span>
        </Button>

        {showTranslate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onTranslate}
            disabled={isTranslating}
            className="h-8 px-2 text-xs"
          >
            {isTranslating ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            ) : (
              <Languages className="h-4 w-4 text-gray-500" />
            )}
            <span className="hidden md:inline ml-1">Translate</span>
          </Button>
        )}

        {onDownload && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDownload}
            disabled={isDownloading}
            className="h-8 px-2 text-xs hidden sm:flex"
          >
            <Download className="h-4 w-4 text-gray-500" />
            <span className="hidden md:inline ml-1">PDF</span>
          </Button>
        )}

        <Button
          type="button"
          onClick={onSave}
          size="sm"
          disabled={isSaving || isAutoSaving}
          className="h-8 px-3 text-xs"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </header>
  )
}
