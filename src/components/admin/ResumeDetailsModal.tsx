'use client';

import { useState } from 'react';
import { X, Eye } from 'lucide-react';
import { ResumeStatus } from '@prisma/client';
import { AdminResumePreview } from './AdminResumePreview';
import { ResumeData } from '@/types/resume';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCsrfToken } from '@/hooks/useCsrfToken';

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

interface ResumeDetailsModalProps {
  resume: ResumeWithUser;
  onClose: () => void;
}

export function ResumeDetailsModal({ resume, onClose }: ResumeDetailsModalProps) {
  const { csrfFetch } = useCsrfToken();
  const [showPreview, setShowPreview] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handlePreviewResume = async () => {
    setLoading(true);
    try {
      const response = await csrfFetch(`/api/admin/resumes/${resume.id}/preview`);
      if (!response.ok) throw new Error('Failed to fetch resume data');
      
      const data = await response.json();
      setResumeData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('[ResumeDetailsModal] Failed to fetch resume preview:', error);
      // Fallback to opening in new tab
      window.open(`/resumes/${resume.id}`, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Resume Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Title</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{resume.title}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Status</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resume.status)}`}>
                          {resume.status}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Template</td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">{resume.template}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Resume ID</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">{resume.id}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* User Information Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">User Information</h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Name</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{resume.user.name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Email</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{resume.user.email}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">User ID</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">{resume.user.id}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Content Overview Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Content Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500 uppercase">Total Sections</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{resume._count.sections}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-500 uppercase">Template</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900 capitalize">{resume.template}</div>
                </div>
              </div>
            </Card>

            {/* Timeline Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Timeline</h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Created</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(resume.createdAt).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 uppercase">Last Updated</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(resume.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                onClick={handlePreviewResume}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Resume Preview Modal */}
      {showPreview && resumeData && (
        <AdminResumePreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          data={resumeData}
          template={resume.template}
          resumeTitle={resume.title}
        />
      )}
    </div>
  );
}