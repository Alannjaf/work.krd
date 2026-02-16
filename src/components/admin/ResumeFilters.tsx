'use client'

import { useEffect, useState } from 'react'
import { ResumeStatus } from '@prisma/client'
import { Search } from 'lucide-react'
import { getAllTemplates, TemplateInfo } from '@/lib/templates'
import { devError } from '@/lib/admin-utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface ResumeFiltersProps {
  search: string
  status: ResumeStatus | ''
  template: string
  onSearchChange: (search: string) => void
  onStatusChange: (status: ResumeStatus | '') => void
  onTemplateChange: (template: string) => void
}

interface TemplatesByTier {
  free: Array<TemplateInfo & { tier: 'free' }>
  pro: Array<TemplateInfo & { tier: 'pro' }>
}

export function ResumeFilters({
  search,
  status,
  template,
  onSearchChange,
  onStatusChange,
  onTemplateChange}: ResumeFiltersProps) {
  const { t } = useLanguage()
  const [templates, setTemplates] = useState<TemplateInfo[]>(getAllTemplates())

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates')
        if (response.ok) {
          const data: TemplatesByTier = await response.json()
          const allTemplates = [
            ...(data.free || []),
            ...(data.pro || [])
          ]
          const uniqueTemplates = Array.from(
            new Map(allTemplates.map(t => [t.id, { id: t.id, name: t.name, description: t.description, category: t.category }])).values()
          )
          setTemplates(uniqueTemplates.length > 0 ? uniqueTemplates : getAllTemplates())
        }
      } catch (error) {
        devError('[ResumeFilters] Failed to fetch templates:', error)
        setTemplates(getAllTemplates())
      }
    }

    fetchTemplates()
  }, [])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
        <input
          type="text"
          data-admin-search
          placeholder={t('pages.admin.resumes.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('pages.admin.resumes.statusLabel')}
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ResumeStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('pages.admin.resumes.allStatus')}</option>
            <option value="DRAFT">{t('pages.admin.resumes.draft')}</option>
            <option value="PUBLISHED">{t('pages.admin.resumes.published')}</option>
            <option value="ARCHIVED">{t('pages.admin.resumes.archived')}</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('pages.admin.resumes.templateLabel')}
          </label>
          <select
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('pages.admin.resumes.allTemplates')}</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
