'use client'

import React, { useState, useMemo } from 'react'
import { Eye, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Columns3 } from 'lucide-react'
import { ResumeStatus } from '@prisma/client'
import { formatAdminDate, formatAdminDateFull } from '@/lib/admin-utils'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

interface ResumeWithUser {
  id: string
  title: string
  status: ResumeStatus
  template: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  _count: {
    sections: number
  }
}

type SortField = 'title' | 'user' | 'status' | 'sections' | 'createdAt'
type SortDirection = 'asc' | 'desc'

type ColumnKey = 'title' | 'user' | 'status' | 'sections' | 'createdAt' | 'actions'
const COLUMN_KEYS: ColumnKey[] = ['title', 'user', 'status', 'sections', 'createdAt', 'actions']
const COLUMN_I18N_KEYS: Record<ColumnKey, string> = {
  title: 'pages.admin.resumes.resume',
  user: 'pages.admin.resumes.user',
  status: 'pages.admin.resumes.statusLabel',
  sections: 'pages.admin.resumes.sections',
  createdAt: 'pages.admin.resumes.created',
  actions: 'pages.admin.resumes.actions',
}

interface ResumeTableProps {
  resumes: ResumeWithUser[]
  selectedIds: string[]
  onSelectId: (id: string) => void
  onSelectAll: () => void
  onViewResume: (resume: ResumeWithUser) => void
  onDeleteResume: (id: string) => void
  /** Server-side sort field (when provided, overrides client-side sort for that column) */
  sortBy?: string
  /** Server-side sort direction */
  sortOrder?: 'asc' | 'desc'
  /** Callback for server-side sorting — called with column name */
  onSort?: (column: string) => void
}

export function ResumeTable({
  resumes,
  selectedIds,
  onSelectId,
  onSelectAll,
  onViewResume,
  onDeleteResume,
  sortBy: serverSortBy,
  sortOrder: serverSortOrder,
  onSort: serverOnSort,
}: ResumeTableProps) {
  const { t } = useLanguage()

  // Build columns with translated labels
  const ALL_COLUMNS = COLUMN_KEYS.map(key => ({ key, label: t(COLUMN_I18N_KEYS[key]) }))

  // Server-side sort mode: when onSort callback is provided, delegate sorting to the parent/API
  const isServerSort = !!serverOnSort

  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(new Set(ALL_COLUMNS.map(c => c.key)))
  const [showColumnToggle, setShowColumnToggle] = useState(false)

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  const handleSort = (field: SortField) => {
    if (isServerSort) {
      // Delegate to server-side sort callback
      serverOnSort(field)
      return
    }
    // Client-side sort toggle
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        // Third click: clear sort
        setSortField(null)
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Resolve active sort state: server-side props take precedence when available
  const activeSortField: SortField | null = isServerSort
    ? (serverSortBy as SortField | undefined) ?? null
    : sortField
  const activeSortDirection: SortDirection = isServerSort
    ? (serverSortOrder ?? 'desc')
    : sortDirection

  const sortedResumes = useMemo(() => {
    // When server-side sorting is active, data arrives pre-sorted from the API
    if (isServerSort) return resumes
    if (!sortField) return resumes

    return [...resumes].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'user':
          cmp = (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'sections':
          cmp = a._count.sections - b._count.sections
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'desc' ? -cmp : cmp
    })
  }, [resumes, sortField, sortDirection, isServerSort])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (activeSortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />
    }
    return activeSortDirection === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const getStatusColor = (status: ResumeStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ARCHIVED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
  }

  const thSortableClass = 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'

  return (
    <div>
      <div className="flex justify-end mb-2">
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setShowColumnToggle(prev => !prev)} type="button">
            <Columns3 className="h-4 w-4 mr-1" />
            {t('pages.admin.resumes.columns')}
          </Button>
          {showColumnToggle && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg p-2 z-10 min-w-[160px]">
              {ALL_COLUMNS.map(col => (
                <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === resumes.length && resumes.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              {visibleColumns.has('title') && (
                <th className={thSortableClass} onClick={() => handleSort('title')}>
                  <span className="flex items-center">
                    {t('pages.admin.resumes.resume')}
                    <SortIcon field="title" />
                  </span>
                </th>
              )}
              {visibleColumns.has('user') && (
                <th className={thSortableClass} onClick={() => handleSort('user')}>
                  <span className="flex items-center">
                    {t('pages.admin.resumes.user')}
                    <SortIcon field="user" />
                  </span>
                </th>
              )}
              {visibleColumns.has('status') && (
                <th className={thSortableClass} onClick={() => handleSort('status')}>
                  <span className="flex items-center">
                    {t('pages.admin.resumes.statusLabel')}
                    <SortIcon field="status" />
                  </span>
                </th>
              )}
              {visibleColumns.has('sections') && (
                <th className={thSortableClass} onClick={() => handleSort('sections')}>
                  <span className="flex items-center">
                    {t('pages.admin.resumes.sections')}
                    <SortIcon field="sections" />
                  </span>
                </th>
              )}
              {visibleColumns.has('createdAt') && (
                <th className={thSortableClass} onClick={() => handleSort('createdAt')}>
                  <span className="flex items-center">
                    {t('pages.admin.resumes.created')}
                    <SortIcon field="createdAt" />
                  </span>
                </th>
              )}
              {visibleColumns.has('actions') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('pages.admin.resumes.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedResumes.map((resume) => (
              <tr key={resume.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(resume.id)}
                    onChange={() => onSelectId(resume.id)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </td>
                {visibleColumns.has('title') && (
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {resume.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {resume.template} {t('pages.admin.resumes.template')}
                      </div>
                    </div>
                  </td>
                )}
                {visibleColumns.has('user') && (
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {resume.user.name || t('pages.admin.resumes.naUser')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {resume.user.email}
                      </div>
                    </div>
                  </td>
                )}
                {visibleColumns.has('status') && (
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resume.status)}`}>
                      {resume.status}
                    </span>
                  </td>
                )}
                {visibleColumns.has('sections') && (
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {resume._count.sections}
                  </td>
                )}
                {visibleColumns.has('createdAt') && (
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <span title={formatAdminDateFull(resume.createdAt)}>
                      {formatAdminDate(resume.createdAt)}
                    </span>
                  </td>
                )}
                {visibleColumns.has('actions') && (
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => onViewResume(resume)} title={t('pages.admin.resumes.viewResume')} aria-label={t('pages.admin.resumes.viewResume')}>
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDeleteResume(resume.id)} title={t('pages.admin.resumes.deleteResume')} aria-label={t('pages.admin.resumes.deleteResume')}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  )
}