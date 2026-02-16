'use client';

import React, { useState, useMemo } from 'react';
import { Eye, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ResumeStatus } from '@prisma/client';
import { formatAdminDate, formatAdminDateFull } from '@/lib/admin-utils';
import { Button } from '@/components/ui/button';

interface ResumeWithUser {
  id: string;
  title: string;
  status: ResumeStatus;
  template: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  _count: {
    sections: number;
  };
}

type SortField = 'title' | 'user' | 'status' | 'sections' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface ResumeTableProps {
  resumes: ResumeWithUser[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onSelectAll: () => void;
  onViewResume: (resume: ResumeWithUser) => void;
  onDeleteResume: (id: string) => void;
  /** Server-side sort field (when provided, overrides client-side sort for that column) */
  sortBy?: string;
  /** Server-side sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Callback for server-side sorting — called with column name */
  onSort?: (column: string) => void;
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
  // Server-side sort mode: when onSort callback is provided, delegate sorting to the parent/API
  const isServerSort = !!serverOnSort;

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (isServerSort) {
      // Delegate to server-side sort callback
      serverOnSort(field);
      return;
    }
    // Client-side sort toggle
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        // Third click: clear sort
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Resolve active sort state: server-side props take precedence when available
  const activeSortField: SortField | null = isServerSort
    ? (serverSortBy as SortField | undefined) ?? null
    : sortField;
  const activeSortDirection: SortDirection = isServerSort
    ? (serverSortOrder ?? 'desc')
    : sortDirection;

  const sortedResumes = useMemo(() => {
    // When server-side sorting is active, data arrives pre-sorted from the API
    if (isServerSort) return resumes;
    if (!sortField) return resumes;

    return [...resumes].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'user':
          cmp = (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'sections':
          cmp = a._count.sections - b._count.sections;
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });
  }, [resumes, sortField, sortDirection, isServerSort]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (activeSortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    }
    return activeSortDirection === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const getStatusColor = (status: ResumeStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ARCHIVED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
  };

  const thSortableClass = 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';

  return (
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
              <th className={thSortableClass} onClick={() => handleSort('title')}>
                <span className="flex items-center">
                  Resume
                  <SortIcon field="title" />
                </span>
              </th>
              <th className={thSortableClass} onClick={() => handleSort('user')}>
                <span className="flex items-center">
                  User
                  <SortIcon field="user" />
                </span>
              </th>
              <th className={thSortableClass} onClick={() => handleSort('status')}>
                <span className="flex items-center">
                  Status
                  <SortIcon field="status" />
                </span>
              </th>
              <th className={thSortableClass} onClick={() => handleSort('sections')}>
                <span className="flex items-center">
                  Sections
                  <SortIcon field="sections" />
                </span>
              </th>
              <th className={thSortableClass} onClick={() => handleSort('createdAt')}>
                <span className="flex items-center">
                  Created
                  <SortIcon field="createdAt" />
                </span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
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
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {resume.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {resume.template} template
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {resume.user.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {resume.user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resume.status)}`}>
                    {resume.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {resume._count.sections}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <span title={formatAdminDateFull(resume.createdAt)}>
                    {formatAdminDate(resume.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onViewResume(resume)} title="View Resume" aria-label="View Resume">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteResume(resume.id)} title="Delete Resume" aria-label="Delete Resume">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}