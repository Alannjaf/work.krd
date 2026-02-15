'use client';

import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { ResumeStatus } from '@prisma/client';

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

interface ResumeTableProps {
  resumes: ResumeWithUser[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onSelectAll: () => void;
  onViewResume: (resume: ResumeWithUser) => void;
  onDeleteResume: (id: string) => void;
}

export function ResumeTable({
  resumes,
  selectedIds,
  onSelectId,
  onSelectAll,
  onViewResume,
  onDeleteResume}: ResumeTableProps) {
  const getStatusColor = (status: ResumeStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'ARCHIVED':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getSectionsCount = (count: ResumeWithUser['_count']) => {
    return count.sections;
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === resumes.length && resumes.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Resume
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sections
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resumes.map((resume) => (
              <tr key={resume.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(resume.id)}
                    onChange={() => onSelectId(resume.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {resume.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {resume.template} template
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900">
                      {resume.user.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {resume.user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resume.status)}`}>
                    {resume.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getSectionsCount(resume._count)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => onViewResume(resume)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Resume"
                      aria-label="View Resume"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteResume(resume.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Resume"
                      aria-label="Delete Resume"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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